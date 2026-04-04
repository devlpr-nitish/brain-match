# Brain Match

**Brain Match** is a real-time, two-player hint-and-guess duel. Each player picks a secret in a shared category, trades hints in a live chat, and tries to guess the opponent’s word before their own is cracked.

## Game rules

- **Two players.** One player hosts a room and shares the short code; the other joins. Both choose display names and proceed once the lobby is full.
- **Category and secrets.** Pick a category (numbers, objects, famous people, or movies and shows). Each player enters a private secret for the other to guess. Secrets stay hidden until the match ends or the game reveals them through play.
- **Arena turns.** The match runs in a shared chat. On your turn you may **ask for a hint** or **submit a guess**. If you ask for a hint, your opponent must answer with a clue; play then returns to you to use that clue and continue.
- **Scoring and outcome.** Wrong guesses are tracked per player. The first player to guess the opponent’s secret correctly wins the round. The win screen supports playing again with the same setup flow.

In the web app, a longer **Rules** page is available at `/rules`.

## Tech stack

**Frontend** (`frontend/`)

- [Next.js](https://nextjs.org/) (App Router) and [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4 and [tw-animate-css](https://github.com/Wombosvideo/tw-animate-css)
- UI: [shadcn/ui](https://ui.shadcn.com/) patterns, [Base UI](https://base-ui.com/), [class-variance-authority](https://cva.style/), [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- Icons: [Lucide React](https://lucide.dev/)
- Theming: [next-themes](https://github.com/pacocoursey/next-themes)
- Real-time play over **WebSockets** to the game server (`NEXT_PUBLIC_WS_BASE` in the client environment)

**Backend** (`backend/`)

- [Go](https://go.dev/) 1.24
- HTTP and routing: [Echo](https://echo.labstack.com/) v4
- WebSockets: [Gorilla WebSocket](https://github.com/gorilla/websocket)

The repository is split into a Next.js client and a Go WebSocket server; the client drives the full screen flow (name, room, category, secret, arena, win) against live server state.
