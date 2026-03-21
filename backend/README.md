## MindMatch Backend

WebSocket backend for 2-player room-based gameplay.

### Start server

```bash
cd /Users/nitishkumar/Projects/brain-match/backend
go run cmd/server/main.go
```

Optional custom port:

```bash
PORT=8090 go run cmd/server/main.go
```

### Connect clients

- `ws://localhost:8080/ws?room=ABCD&name=Alice`
- `ws://localhost:8080/ws?room=ABCD&name=Bob`

You can also connect to root route with WebSocket:

- `ws://localhost:8080/?room=ABCD&name=Alice`

### Server behavior

- Max 2 players per room.
- If `room` query param is missing, server auto-creates a 4-letter room code.
- Players are assigned roles in join order:
  - first = `P1`
  - second = `P2`

### Outgoing server events

- `room_joined`
- `hello`
- `room_state`
- `player_joined`
- `player_left`
- `pong` (for `ping`)
- `chat` (relayed)
- `game_event` (relayed)
- `error`

### Incoming client events

Expected JSON shape:

```json
{
  "type": "categoryChosen",
  "payload": {"category": "numbers"}
}
```

Routing rules:

- `type = "ping"` -> responds with `pong`
- `type = "chat"` -> relays as `chat` to opponent
- Any other `type` -> relays as `game_event` to opponent
- Non-JSON text -> relays as `relay` to opponent

### Smoke test

A tiny relay test client is included at `cmd/smoke/main.go`.

```bash
cd /Users/nitishkumar/Projects/brain-match/backend
PORT=8091 go run cmd/server/main.go
```

In another terminal:

```bash
cd /Users/nitishkumar/Projects/brain-match/backend
PORT=8091 ROOM=TEST go run cmd/smoke/main.go
```

Expected output:

`SMOKE PASS: received game_event relay`
