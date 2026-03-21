## MindMatch Frontend

This folder contains the Next.js frontend for **MindMatch — The Hint Duel**.

The app includes:
- Multi-screen game flow (`splash` → `waiting` → `category` → `secret` → `arena` → `win`)
- Local multiplayer simulation with `BroadcastChannel` (open two tabs)
- Neon game UI converted into reusable React components

## Getting Started

Run the development server:

```bash
npm run dev
```

If your backend runs on a custom port, set websocket base URL:

```bash
NEXT_PUBLIC_WS_BASE=ws://localhost:8080/ws npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To test multiplayer locally:
1. Open the app in two browser tabs.
2. In tab 1, create a room.
3. In tab 2, join using the shown 4-letter room code.

Make sure backend is running first:

```bash
cd /Users/nitishkumar/Projects/brain-match/backend
go run cmd/server/main.go
```

Production checks:

```bash
npm run lint
npm run build
```

Main files:
- `app/page.tsx`
- `components/mindmatch/MindMatchGame.tsx`
- `app/globals.css`
