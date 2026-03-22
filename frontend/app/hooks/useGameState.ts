import { useCallback, useRef, useState } from "react";
import type { CategoryKey, ChatMessage, Names, Role, TurnMode, WrongGuesses } from "../types/types";

export function useGameState() {
  // Room flow inputs
  const [playerNameInput, setPlayerNameInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");

  const [roomCode, setRoomCode] = useState("");
  const [myName, setMyName] = useState("");
  const [myRole, setMyRole] = useState<Role>("P1");

  // Ref mirror of myRole — always up-to-date even inside stale WS closures
  const myRoleRef = useRef<Role>("P1");
  const setMyRoleSync = useCallback((role: Role) => {
    myRoleRef.current = role;
    setMyRole(role);
  }, []);

  const [names, setNames] = useState<Names>({ P1: "", P2: "" });
  const [wrongGuesses, setWrongGuesses] = useState<WrongGuesses>({ P1: 0, P2: 0 });
  const [round, setRound] = useState(1);
  const [winnerRole, setWinnerRole] = useState<Role | null>(null);

  const [myCategory, setMyCategory] = useState<CategoryKey | "">("");
  const [mySecret, setMySecret] = useState("");
  const [opponentSecret, setOpponentSecret] = useState(""); // revealed at end
  const [secretInput, setSecretInput] = useState("");

  const [iReady, setIReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  // Track hint count per player for arena display
  const [hintCounts, setHintCounts] = useState<Record<Role, number>>({ P1: 0, P2: 0 });

  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [askerRole, setAskerRole] = useState<Role>("P1");
  const [activeRole, setActiveRole] = useState<Role>("P1");
  const [turnMode, setTurnMode] = useState<TurnMode>("take_turn");

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const resetRoundState = useCallback(() => {
    setIReady(false);
    setOpponentReady(false);
    setMyCategory("");
    setMySecret("");
    setOpponentSecret("");
    setWinnerRole(null);
    setSecretInput("");
    setMessageInput("");
    setHintCounts({ P1: 0, P2: 0 });
    setChatMessages([]);
    setAskerRole("P1");
    setActiveRole("P1");
    setTurnMode("take_turn");
  }, []);

  const resetGameState = useCallback(() => {
    setWrongGuesses({ P1: 0, P2: 0 });
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
    myRoleRef,
    setMyRole: setMyRoleSync,

    // Player info
    names,
    setNames,
    wrongGuesses,
    setWrongGuesses,
    round,
    setRound,
    winnerRole,
    setWinnerRole,

    // Game setup
    myCategory,
    setMyCategory,
    mySecret,
    setMySecret,
    opponentSecret,
    setOpponentSecret,
    secretInput,
    setSecretInput,

    // Sync flags
    iReady,
    setIReady,
    opponentReady,
    setOpponentReady,

    // Arena
    hintCounts,
    setHintCounts,
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
