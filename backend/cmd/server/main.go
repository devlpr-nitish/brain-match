package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

const (
	maxPlayersPerRoom = 2
	roomCodeLength    = 4
)

type Player struct {
	ID       string
	Name     string
	Role     string
	Conn     *websocket.Conn
	WriteMux sync.Mutex
}

type Room struct {
	Code    string
	Players map[string]*Player
}

type Hub struct {
	Rooms map[string]*Room
	Mux   sync.RWMutex
}

type playerSnapshot struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}

type serverEnvelope struct {
	Type    string           `json:"type"`
	Message string           `json:"message,omitempty"`
	Room    string           `json:"roomCode,omitempty"`
	Player  *playerSnapshot  `json:"player,omitempty"`
	Players []playerSnapshot `json:"players,omitempty"`
	From    *playerSnapshot  `json:"from,omitempty"`
	Payload json.RawMessage  `json:"payload,omitempty"`
}

type clientEnvelope struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // restrict this in production
	},
}

var hub = &Hub{Rooms: make(map[string]*Room)}

func init() {
	rand.Seed(time.Now().UnixNano())
}

func main() {
	e := echo.New()

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]any{"ok": true})
	})

	e.GET("/ws", handleWebSocket)
	e.GET("/", func(c echo.Context) error {
		if websocket.IsWebSocketUpgrade(c.Request()) {
			return handleWebSocket(c)
		}

		return c.String(http.StatusOK, "MindMatch backend is running")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	e.Logger.Fatal(e.Start(":" + port))
}

func handleWebSocket(c echo.Context) error {
	playerName := strings.TrimSpace(c.QueryParam("name"))
	if playerName == "" {
		playerName = "Player"
	}

	requestedRoom := strings.ToUpper(strings.TrimSpace(c.QueryParam("room")))

	conn, err := upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return err
	}

	roomCode, player, joinErr := hub.JoinRoom(requestedRoom, playerName, conn)
	if joinErr != nil {
		_ = writeJSON(conn, serverEnvelope{Type: "error", Message: joinErr.Error()})
		conn.Close()
		return nil
	}

	defer conn.Close()
	defer hub.LeaveRoom(roomCode, player.ID)

	hub.notifyRoomState(roomCode)
	hub.broadcastExcept(roomCode, player.ID, serverEnvelope{
		Type:   "player_joined",
		Room:   roomCode,
		Player: snapshotFromPlayer(player),
	})

	err = writeToPlayer(player, serverEnvelope{
		Type:    "room_joined",
		Message: "Connected to room",
		Room:    roomCode,
		Player:  snapshotFromPlayer(player),
		Players: hub.roomPlayers(roomCode),
	})
	if err != nil {
		log.Println("Initial write error:", err)
		return err
	}

	err = writeToPlayer(player, serverEnvelope{Type: "hello", Message: "Hello, World!"})
	if err != nil {
		log.Println("Hello write error:", err)
		return err
	}

	for {
		_, msg, readErr := conn.ReadMessage()
		if readErr != nil {
			log.Println("Read error:", readErr)
			break
		}

		incoming := clientEnvelope{}
		err = json.Unmarshal(msg, &incoming)
		if err != nil {
			hub.broadcastExcept(roomCode, player.ID, serverEnvelope{
				Type:    "relay",
				Room:    roomCode,
				From:    snapshotFromPlayer(player),
				Payload: msg,
			})
			continue
		}

		switch incoming.Type {
		case "ping":
			_ = writeToPlayer(player, serverEnvelope{Type: "pong", Message: "pong"})
		case "chat":
			hub.broadcastExcept(roomCode, player.ID, serverEnvelope{
				Type:    "chat",
				Room:    roomCode,
				From:    snapshotFromPlayer(player),
				Payload: incoming.Payload,
			})
		default:
			hub.broadcastExcept(roomCode, player.ID, serverEnvelope{
				Type:    "game_event",
				Room:    roomCode,
				From:    snapshotFromPlayer(player),
				Payload: msg,
			})
		}
	}

	return nil
}

func (hub *Hub) JoinRoom(requestedCode string, playerName string, conn *websocket.Conn) (string, *Player, error) {
	hub.Mux.Lock()
	defer hub.Mux.Unlock()

	roomCode := requestedCode
	if roomCode == "" {
		roomCode = hub.generateRoomCodeLocked()
	}

	room, found := hub.Rooms[roomCode]
	if !found {
		room = &Room{
			Code:    roomCode,
			Players: make(map[string]*Player),
		}
		hub.Rooms[roomCode] = room
	}

	if len(room.Players) >= maxPlayersPerRoom {
		return "", nil, echo.NewHTTPError(http.StatusConflict, "room is full")
	}

	role := "P1"
	if len(room.Players) == 1 {
		role = "P2"
	}

	player := &Player{
		ID:   randomID(8),
		Name: playerName,
		Role: role,
		Conn: conn,
	}

	room.Players[player.ID] = player
	return roomCode, player, nil
}

func (hub *Hub) LeaveRoom(roomCode string, playerID string) {
	hub.Mux.Lock()
	room, ok := hub.Rooms[roomCode]
	if !ok {
		hub.Mux.Unlock()
		return
	}

	player, exists := room.Players[playerID]
	if !exists {
		hub.Mux.Unlock()
		return
	}

	delete(room.Players, playerID)
	removeRoom := len(room.Players) == 0
	if removeRoom {
		delete(hub.Rooms, roomCode)
	}

	remainingPlayers := make([]*Player, 0, len(room.Players))
	for _, roomPlayer := range room.Players {
		remainingPlayers = append(remainingPlayers, roomPlayer)
	}
	hub.Mux.Unlock()

	if removeRoom {
		return
	}

	leaveEnvelope := serverEnvelope{
		Type:   "player_left",
		Room:   roomCode,
		Player: snapshotFromPlayer(player),
	}

	for _, roomPlayer := range remainingPlayers {
		_ = writeToPlayer(roomPlayer, leaveEnvelope)
	}

	hub.notifyRoomState(roomCode)
}

func (hub *Hub) notifyRoomState(roomCode string) {
	hub.Mux.RLock()
	room, ok := hub.Rooms[roomCode]
	if !ok {
		hub.Mux.RUnlock()
		return
	}

	players := make([]playerSnapshot, 0, len(room.Players))
	targets := make([]*Player, 0, len(room.Players))
	for _, player := range room.Players {
		players = append(players, playerSnapshot{ID: player.ID, Name: player.Name, Role: player.Role})
		targets = append(targets, player)
	}
	hub.Mux.RUnlock()

	envelope := serverEnvelope{
		Type:    "room_state",
		Room:    roomCode,
		Players: players,
	}

	for _, player := range targets {
		_ = writeToPlayer(player, envelope)
	}
}

func (hub *Hub) roomPlayers(roomCode string) []playerSnapshot {
	hub.Mux.RLock()
	defer hub.Mux.RUnlock()

	room, exists := hub.Rooms[roomCode]
	if !exists {
		return nil
	}

	players := make([]playerSnapshot, 0, len(room.Players))
	for _, player := range room.Players {
		players = append(players, playerSnapshot{ID: player.ID, Name: player.Name, Role: player.Role})
	}

	return players
}

func (hub *Hub) broadcastExcept(roomCode string, senderID string, envelope serverEnvelope) {
	hub.Mux.RLock()
	room, found := hub.Rooms[roomCode]
	if !found {
		hub.Mux.RUnlock()
		return
	}

	targets := make([]*Player, 0, len(room.Players))
	for id, player := range room.Players {
		if id == senderID {
			continue
		}
		targets = append(targets, player)
	}
	hub.Mux.RUnlock()

	for _, player := range targets {
		_ = writeToPlayer(player, envelope)
	}
}

func (hub *Hub) generateRoomCodeLocked() string {
	for {
		candidate := randomCode(roomCodeLength)
		if _, exists := hub.Rooms[candidate]; !exists {
			return candidate
		}
	}
}

func snapshotFromPlayer(player *Player) *playerSnapshot {
	if player == nil {
		return nil
	}

	return &playerSnapshot{
		ID:   player.ID,
		Name: player.Name,
		Role: player.Role,
	}
}

func randomCode(length int) string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	builder := strings.Builder{}
	builder.Grow(length)

	for i := 0; i < length; i++ {
		builder.WriteByte(letters[rand.Intn(len(letters))])
	}

	return builder.String()
}

func randomID(length int) string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	builder := strings.Builder{}
	builder.Grow(length)

	for i := 0; i < length; i++ {
		builder.WriteByte(chars[rand.Intn(len(chars))])
	}

	return builder.String()
}

func writeJSON(conn *websocket.Conn, payload any) error {
	message, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return conn.WriteMessage(websocket.TextMessage, message)
}

func writeToPlayer(player *Player, payload any) error {
	if player == nil || player.Conn == nil {
		return nil
	}

	player.WriteMux.Lock()
	defer player.WriteMux.Unlock()

	return writeJSON(player.Conn, payload)
}
