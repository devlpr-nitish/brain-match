export type Role = "P1" | "P2";

export type Screen = "name" | "room-choice" | "join-input" | "room-created" | "waiting" | "category" | "secret" | "arena" | "win";

export type ChatType = "hint" | "guess" | "system" | "correct";

export type ChatMessage = {
  id: number;
  text: string;
  type: ChatType;
  label?: string;
};

export type WrongGuesses = Record<Role, number>;
export type Names = Record<Role, string>;

// "take_turn"  = it's your turn: you can ask for hint or guess
// "give_hint"  = opponent asked for hint, you must provide one
export type TurnMode = "take_turn" | "give_hint";

export type CategoryKey = "numbers" | "objects" | "person" | "movie";

export type PlayerSnapshot = {
  id: string;
  name: string;
  role: Role;
};

export type ClientGameEvent =
  | { type: "categoryChosen"; payload: { category: CategoryKey } }
  | { type: "secretReady"; payload: { secret: string } }
  | { type: "gameStart" }
  | { type: "requestHint"; payload: { text: string; requester: Role } }
  | { type: "hint"; payload: { text: string; label: string; player: Role; requester: Role } }
  | { type: "guess"; payload: { text: string; player: Role } }
  | {
      type: "guessResult";
      payload: {
        correct: boolean;
        player: Role;
        secret: string;
        wrongGuesses: WrongGuesses;
      };
    }
  | { type: "revealSecret"; payload: { secret: string; player: Role } }
  | { type: "roundNext" }
  | { type: "ping" };

export type ServerEnvelope = {
  type:
    | "room_joined"
    | "hello"
    | "room_state"
    | "player_joined"
    | "player_left"
    | "pong"
    | "chat"
    | "game_event"
    | "relay"
    | "error";
  message?: string;
  roomCode?: string;
  player?: PlayerSnapshot;
  players?: PlayerSnapshot[];
  from?: PlayerSnapshot;
  payload?: unknown;
};

export type GameChannelMessage =
  | { type: "join"; name: string }
  | { type: "hostInfo"; name: string }
  | { type: "categoryChosen"; category: CategoryKey }
  | { type: "secretReady"; secret: string }
  | { type: "gameStart" }
  | { type: "hint"; text: string; label: string; player: Role }
  | { type: "guess"; text: string; player: Role }
  | {
      type: "guessResult";
      correct: boolean;
      player: Role;
      secret: string;
      wrongGuesses: WrongGuesses;
    }
  | { type: "roundNext" }
  | { type: "leave" };