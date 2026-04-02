import { useCallback, useRef } from "react";
import type { ClientGameEvent, Role, ServerEnvelope } from "../types/types";

const wsBase = process.env.NEXT_PUBLIC_WS_BASE ?? "ws://192.168.1.6:8080/ws";

export function useWebSocketConnection() {
  const socketRef = useRef<WebSocket | null>(null);

  const closeSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const sendEvent = useCallback((event: ClientGameEvent) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify(event));
  }, []);

  const connectSocket = useCallback(
    (
      code: string,
      playerName: string,
      onRoomJoined: (roomCode: string, role: Role, players: Array<{ role: Role; name: string }>) => void,
      onRoomState: (players: Array<{ role: Role; name: string }>) => void,
      onPlayerJoined: (name: string) => void,
      onGameEvent: (event: ClientGameEvent) => void,
      onError: (message: string) => void,
      onConnected: () => void,
      onDisconnected: (shouldNotify: boolean) => void,
    ) => {
      closeSocket();

      const endpoint = new URL(wsBase);
      endpoint.searchParams.set("room", code);
      endpoint.searchParams.set("name", playerName);

      const socket = new WebSocket(endpoint.toString());
      socketRef.current = socket;

      socket.onopen = () => {
        onConnected();
      };

      socket.onmessage = (event) => {
        const envelope = parseEnvelope(String(event.data));
        if (!envelope) return;

        switch (envelope.type) {
          case "room_joined":
            if (envelope.roomCode && envelope.player?.role) {
              onRoomJoined(envelope.roomCode, envelope.player.role, envelope.players ?? []);
            }
            break;
          case "room_state":
            onRoomState(envelope.players ?? []);
            break;
          case "player_joined":
            if (envelope.player?.name) {
              onPlayerJoined(envelope.player.name);
            }
            break;
          case "game_event":
          case "relay": {
            const gameEvent = parseGameEvent(envelope.payload);
            if (gameEvent) onGameEvent(gameEvent);
            break;
          }
          case "error":
            onError(envelope.message ?? "Connection error");
            break;
          case "hello":
          case "pong":
          case "chat":
          case "player_left":
            break;
        }
      };

      socket.onclose = () => {
        onDisconnected(true);
      };
    },
    [closeSocket],
  );

  return { socketRef, closeSocket, sendEvent, connectSocket };
}

function parseEnvelope(raw: string): ServerEnvelope | null {
  try {
    return JSON.parse(raw) as ServerEnvelope;
  } catch {
    return null;
  }
}

function parseGameEvent(payload: unknown): ClientGameEvent | null {
  if (!payload || typeof payload !== "object") return null;
  if (!("type" in payload)) return null;
  return payload as ClientGameEvent;
}
