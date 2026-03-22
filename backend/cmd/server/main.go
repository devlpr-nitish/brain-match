package main

import (
	"net/http"
	"os"

	"backend/internal/ws"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()

	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]any{"ok": true})
	})

	e.GET("/ws", ws.HandleWebSocket)

	e.GET("/", func(c echo.Context) error {
		if websocket.IsWebSocketUpgrade(c.Request()) {
			return ws.HandleWebSocket(c)
		}
		return c.String(http.StatusOK, "MindMatch backend is running")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	e.Logger.Fatal(e.Start(":" + port))
}