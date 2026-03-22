package ws

import (
	"encoding/json"
	"net/http"
	"strings"

	"backend/internal/hub"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // restrict this in production
	},
}

// Global hub instance
var GameHub = hub.New()

// HandleWebSocket manages the core WebSocket connection and message routing.
func HandleWebSocket(c echo.Context) error {
	playerName := strings.TrimSpace(c.QueryParam("name"))
	if playerName == "" {
		playerName = "Player"
	}

	requestedRoom := strings.ToUpper(strings.TrimSpace(c.QueryParam("room")))

	conn, err := upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
	if err != nil {
		hub.Log("Upgrade error:", err)
		return err
	}

	roomCode, player, joinErr := GameHub.JoinRoom(requestedRoom, playerName, conn)
	if joinErr != nil {
		_ = hub.WriteToPlayer(&hub.Player{Conn: conn}, hub.ServerEnvelope{Type: "error", Message: joinErr.Error()})
		conn.Close()
		return nil
	}

	defer conn.Close()
	defer GameHub.LeaveRoom(roomCode, player.ID)

	GameHub.NotifyRoomState(roomCode)
	GameHub.BroadcastExcept(roomCode, player.ID, hub.ServerEnvelope{
		Type:   "player_joined",
		Room:   roomCode,
		Player: hub.SnapshotFromPlayer(player),
	})

	err = hub.WriteToPlayer(player, hub.ServerEnvelope{
		Type:    "room_joined",
		Message: "Connected to room",
		Room:    roomCode,
		Player:  hub.SnapshotFromPlayer(player),
		Players: GameHub.RoomPlayers(roomCode),
	})
	if err != nil {
		hub.Log("Initial write error:", err)
		return err
	}

	err = hub.WriteToPlayer(player, hub.ServerEnvelope{Type: "hello", Message: "Hello, World!"})
	if err != nil {
		hub.Log("Hello write error:", err)
		return err
	}

	for {
		_, msg, readErr := conn.ReadMessage()
		if readErr != nil {
			hub.Log("Read error:", readErr)
			break
		}

		incoming := hub.ClientEnvelope{}
		err = json.Unmarshal(msg, &incoming)
		if err != nil {
			// If not matching ClientEnvelope, just relay as raw
			GameHub.BroadcastExcept(roomCode, player.ID, hub.ServerEnvelope{
				Type:    "relay",
				Room:    roomCode,
				From:    hub.SnapshotFromPlayer(player),
				Payload: msg,
			})
			continue
		}

		routeMessage(roomCode, player, incoming, msg)
	}

	return nil
}

// routeMessage handles the specific logic for different client message types.
func routeMessage(roomCode string, player *hub.Player, incoming hub.ClientEnvelope, rawMsg []byte) {
	switch incoming.Type {
	case "ping":
		_ = hub.WriteToPlayer(player, hub.ServerEnvelope{Type: "pong", Message: "pong"})

	case "chat":
		GameHub.BroadcastExcept(roomCode, player.ID, hub.ServerEnvelope{
			Type:    "chat",
			Room:    roomCode,
			From:    hub.SnapshotFromPlayer(player),
			Payload: incoming.Payload,
		})

	case "guessResult":
		// CRITICAL: guessResult contains wrongGuesses + correct state, which both sides need!
		// The sender (secret holder) evaluating the guess also needs this echoed back to trigger their local win screen/turn logic simultaneously.
		// So we broadcast to ALL players in the room, including the sender.
		GameHub.BroadcastAll(roomCode, hub.ServerEnvelope{
			Type:    "game_event",
			Room:    roomCode,
			From:    hub.SnapshotFromPlayer(player),
			Payload: rawMsg,
		})

	default:
		// Default game events (requestHint, hint, guess, etc.) just route to the opponent
		GameHub.BroadcastExcept(roomCode, player.ID, hub.ServerEnvelope{
			Type:    "game_event",
			Room:    roomCode,
			From:    hub.SnapshotFromPlayer(player),
			Payload: rawMsg,
		})
	}
}
