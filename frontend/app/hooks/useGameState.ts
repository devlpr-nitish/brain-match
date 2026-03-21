import { useCallback, useState } from "react";
import type { CategoryKey, ChatMessage, Names, Role, Scores } from "../types/types";

export function useGameState() {
  // Room flow inputs
  const [playerNameInput, setPlayerNameInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");

  const [roomCode, setRoomCode] = useState("");
  const [myName, setMyName] = useState("");
  const [myRole, setMyRole] = useState<Role>("P1");

  const [names, setNames] = useState<Names>({ P1: "", P2: "" });
  const [scores, setScores] = useState<Scores>({ P1: 0, P2: 0 });
  const [round, setRound] = useState(1);

  const [myCategory, setMyCategory] = useState<CategoryKey | "">("");
  const [mySecret, setMySecret] = useState("");
  const [secretInput, setSecretInput] = useState("");
  const [myMaxHints, setMyMaxHints] = useState(5);
  const [myHintsLeft, setMyHintsLeft] = useState(5);
  const [hintCount, setHintCount] = useState(0);

  const [iReady, setIReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);

  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [askerRole, setAskerRole] = useState<Role>("P1");
  const [activeRole, setActiveRole] = useState<Role>("P1");
  const [turnMode, setTurnMode] = useState<"ask_or_guess" | "provide_hint" | "guess_after_hint">("ask_or_guess");

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const resetRoundState = useCallback(() => {
    setIReady(false);
    setOpponentReady(false);
    setMyCategory("");
    setMySecret("");
    setSecretInput("");
    setMessageInput("");
    setMyHintsLeft(myMaxHints);
    setHintCount(0);
    setChatMessages([]);
    setAskerRole("P1");
    setActiveRole("P1");
    setTurnMode("ask_or_guess");
  }, [myMaxHints]);

  const resetGameState = useCallback(() => {
    setScores({ P1: 0, P2: 0 });
    setRound(1);
    setRoomCode("");
    setMyName("");
    setNames({ P1: "", P2: "" });
    resetRoundState();
  }, [resetRoundState]);

  return {
    // Room flow inputs
    playerNameInput,
    setPlayerNameInput,
    joinCodeInput,
    setJoinCodeInput,

    // Room state
    roomCode,
    setRoomCode,
    myName,
    setMyName,
    myRole,
    setMyRole,

    // Player info
    names,
    setNames,
    scores,
    setScores,
    round,
    setRound,

    // Game setup
    myCategory,
    setMyCategory,
    mySecret,
    setMySecret,
    secretInput,
    setSecretInput,
    myMaxHints,
    setMyMaxHints,
    myHintsLeft,
    setMyHintsLeft,
    hintCount,
    setHintCount,

    // Turn tracking
    iReady,
    setIReady,
    opponentReady,
    setOpponentReady,

    // Chat & Messages
    messageInput,
    setMessageInput,
    chatMessages,
    setChatMessages,
    askerRole,
    setAskerRole,
    activeRole,
    setActiveRole,
    turnMode,
    setTurnMode,

    // Timer & UI
    timerSeconds,
    setTimerSeconds,
    showConfetti,
    setShowConfetti,

    // Helpers
    resetRoundState,
    resetGameState,
  };
}
