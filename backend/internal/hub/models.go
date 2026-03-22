package hub

import (
	"encoding/json"
	"sync"

	"github.com/gorilla/websocket"
)

// Player represents a connected player in a room.
type Player struct {
	ID       string
	Name     string
	Role     string
	Conn     *websocket.Conn
	WriteMux sync.Mutex
}

// Room holds all players in a single game session.
type Room struct {
	Code    string
	Players map[string]*Player
}

// Hub manages all active rooms.
type Hub struct {
	Rooms map[string]*Room
	Mux   sync.RWMutex
}

// New creates and returns a new Hub.
func New() *Hub {
	return &Hub{Rooms: make(map[string]*Room)}
}

// ─── Wire protocol types ─────────────────────────────────────────────────────

// PlayerSnapshot is the JSON-serialisable view of a player.
type PlayerSnapshot struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Role string `json:"role"`
}

// ServerEnvelope is the shape sent from the server to clients.
type ServerEnvelope struct {
	Type    string           `json:"type"`
	Message string           `json:"message,omitempty"`
	Room    string           `json:"roomCode,omitempty"`
	Player  *PlayerSnapshot  `json:"player,omitempty"`
	Players []PlayerSnapshot `json:"players,omitempty"`
	From    *PlayerSnapshot  `json:"from,omitempty"`
	Payload json.RawMessage  `json:"payload,omitempty"`
}

// ClientEnvelope is the shape received from a client.
type ClientEnvelope struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

// SnapshotFromPlayer converts a *Player into a *PlayerSnapshot.
func SnapshotFromPlayer(p *Player) *PlayerSnapshot {
	if p == nil {
		return nil
	}
	return &PlayerSnapshot{ID: p.ID, Name: p.Name, Role: p.Role}
}
