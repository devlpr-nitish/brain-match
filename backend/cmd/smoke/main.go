package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

type envelope struct {
	Type string `json:"type"`
}

func mustDial(rawURL string) *websocket.Conn {
	conn, _, err := websocket.DefaultDialer.Dial(rawURL, nil)
	if err != nil {
		log.Fatalf("dial failed: %v", err)
	}
	return conn
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	room := os.Getenv("ROOM")
	if room == "" {
		room = "SMOK"
	}

	aURL := url.URL{Scheme: "ws", Host: "localhost:" + port, Path: "/ws", RawQuery: "room=" + room + "&name=Alice"}
	bURL := url.URL{Scheme: "ws", Host: "localhost:" + port, Path: "/ws", RawQuery: "room=" + room + "&name=Bob"}

	a := mustDial(aURL.String())
	defer a.Close()
	b := mustDial(bURL.String())
	defer b.Close()

	_ = a.SetReadDeadline(time.Now().Add(5 * time.Second))
	_ = b.SetReadDeadline(time.Now().Add(5 * time.Second))

	message := []byte(`{"type":"categoryChosen","payload":{"category":"numbers"}}`)
	if err := a.WriteMessage(websocket.TextMessage, message); err != nil {
		log.Fatalf("alice send failed: %v", err)
	}

	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		_, data, err := b.ReadMessage()
		if err != nil {
			log.Fatalf("bob read failed: %v", err)
		}

		msg := envelope{}
		if json.Unmarshal(data, &msg) != nil {
			continue
		}

		if msg.Type == "game_event" {
			fmt.Println("SMOKE PASS: received game_event relay")
			return
		}
	}

	log.Fatal("SMOKE FAIL: no game_event relay received")
}
