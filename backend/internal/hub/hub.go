package hub

import (
	"encoding/json"
	"log"
	"net/http"

	"backend/internal/util"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

const (
	MaxPlayersPerRoom = 2
	RoomCodeLength    = 4
)

// ─── Room management ──────────────────────────────────────────────────────────

// JoinRoom joins the player to an existing room or creates a new one.
// Returns the room code, the new Player, and any error.
func (h *Hub) JoinRoom(requestedCode, playerName string, conn *websocket.Conn) (string, *Player, error) {
	h.Mux.Lock()
	defer h.Mux.Unlock()

	roomCode := requestedCode
	if roomCode == "" {
		roomCode = h.generateRoomCodeLocked()
	}

	room, found := h.Rooms[roomCode]
	if !found {
		room = &Room{
			Code:    roomCode,
			Players: make(map[string]*Player),
		}
		h.Rooms[roomCode] = room
	}

	if len(room.Players) >= MaxPlayersPerRoom {
		return "", nil, echo.NewHTTPError(http.StatusConflict, "room is full")
	}

	role := "P1"
	if len(room.Players) == 1 {
		role = "P2"
	}

	player := &Player{
		ID:   util.RandomID(8),
		Name: playerName,
		Role: role,
		Conn: conn,
	}
	room.Players[player.ID] = player
	return roomCode, player, nil
}

// LeaveRoom removes the player from the room and notifies remaining players.
func (h *Hub) LeaveRoom(roomCode, playerID string) {
	h.Mux.Lock()
	room, ok := h.Rooms[roomCode]
	if !ok {
		h.Mux.Unlock()
		return
	}

	player, exists := room.Players[playerID]
	if !exists {
		h.Mux.Unlock()
		return
	}

	delete(room.Players, playerID)
	removeRoom := len(room.Players) == 0
	if removeRoom {
		delete(h.Rooms, roomCode)
	}

	remaining := make([]*Player, 0, len(room.Players))
	for _, p := range room.Players {
		remaining = append(remaining, p)
	}
	h.Mux.Unlock()

	if removeRoom {
		return
	}

	leaveMsg := ServerEnvelope{
		Type:   "player_left",
		Room:   roomCode,
		Player: SnapshotFromPlayer(player),
	}
	for _, p := range remaining {
		_ = WriteToPlayer(p, leaveMsg)
	}

	h.NotifyRoomState(roomCode)
}

// ─── Broadcast helpers ────────────────────────────────────────────────────────

// BroadcastExcept sends an envelope to every player in the room except the sender.
func (h *Hub) BroadcastExcept(roomCode, senderID string, env ServerEnvelope) {
	h.Mux.RLock()
	room, found := h.Rooms[roomCode]
	if !found {
		h.Mux.RUnlock()
		return
	}
	targets := make([]*Player, 0, len(room.Players))
	for id, p := range room.Players {
		if id != senderID {
			targets = append(targets, p)
		}
	}
	h.Mux.RUnlock()

	for _, p := range targets {
		_ = WriteToPlayer(p, env)
	}
}

// BroadcastAll sends an envelope to every player in the room including the sender.
func (h *Hub) BroadcastAll(roomCode string, env ServerEnvelope) {
	h.Mux.RLock()
	room, found := h.Rooms[roomCode]
	if !found {
		h.Mux.RUnlock()
		return
	}
	targets := make([]*Player, 0, len(room.Players))
	for _, p := range room.Players {
		targets = append(targets, p)
	}
	h.Mux.RUnlock()

	for _, p := range targets {
		_ = WriteToPlayer(p, env)
	}
}

// NotifyRoomState broadcasts current room membership to all players.
func (h *Hub) NotifyRoomState(roomCode string) {
	h.Mux.RLock()
	room, ok := h.Rooms[roomCode]
	if !ok {
		h.Mux.RUnlock()
		return
	}
	snapshots := make([]PlayerSnapshot, 0, len(room.Players))
	targets := make([]*Player, 0, len(room.Players))
	for _, p := range room.Players {
		snapshots = append(snapshots, PlayerSnapshot{ID: p.ID, Name: p.Name, Role: p.Role})
		targets = append(targets, p)
	}
	h.Mux.RUnlock()

	env := ServerEnvelope{Type: "room_state", Room: roomCode, Players: snapshots}
	for _, p := range targets {
		_ = WriteToPlayer(p, env)
	}
}

// RoomPlayers returns a snapshot of all players in the room.
func (h *Hub) RoomPlayers(roomCode string) []PlayerSnapshot {
	h.Mux.RLock()
	defer h.Mux.RUnlock()
	room, found := h.Rooms[roomCode]
	if !found {
		return nil
	}
	snapshots := make([]PlayerSnapshot, 0, len(room.Players))
	for _, p := range room.Players {
		snapshots = append(snapshots, PlayerSnapshot{ID: p.ID, Name: p.Name, Role: p.Role})
	}
	return snapshots
}

// ─── Write helpers ────────────────────────────────────────────────────────────

// WriteToPlayer serialises payload as JSON and sends it to the player.
func WriteToPlayer(player *Player, payload any) error {
	if player == nil || player.Conn == nil {
		return nil
	}
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	player.WriteMux.Lock()
	defer player.WriteMux.Unlock()
	return player.Conn.WriteMessage(1 /* TextMessage */, data)
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

func (h *Hub) generateRoomCodeLocked() string {
	for {
		candidate := util.RandomCode(RoomCodeLength)
		if _, exists := h.Rooms[candidate]; !exists {
			return candidate
		}
	}
}

// IsOwner returns true if the player with the given ID is the P1 (room owner).
func (h *Hub) IsOwner(roomCode, playerID string) bool {
	h.Mux.RLock()
	defer h.Mux.RUnlock()
	room, found := h.Rooms[roomCode]
	if !found {
		return false
	}
	p, found := room.Players[playerID]
	if !found {
		return false
	}
	return p.Role == "P1"
}

// PlayerRole returns the role string for the given player.
func (h *Hub) PlayerRole(roomCode, playerID string) string {
	h.Mux.RLock()
	defer h.Mux.RUnlock()
	room, found := h.Rooms[roomCode]
	if !found {
		return ""
	}
	p, found := room.Players[playerID]
	if !found {
		return ""
	}
	return p.Role
}

// log re-export so callers can use hub.Log without importing log
var Log = log.Printf
