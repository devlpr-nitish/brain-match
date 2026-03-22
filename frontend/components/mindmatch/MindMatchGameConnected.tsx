"use client";

import { useCallback, useEffect, useRef } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { GameFlowContainer } from "@/app/containers/GameFlowContainer";
import { RoomFlowContainer } from "@/app/containers/RoomFlowContainer";
import { useGameState, useScreenNavigation, useToast, useWebSocketConnection } from "@/app/hooks";
import type { CategoryKey, ClientGameEvent, Role, WrongGuesses } from "@/app/types";

function generateCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

export function MindMatchGameConnected() {
  const { screen, setScreen, screenRef } = useScreenNavigation("name");
  const gameState = useGameState();
  const { toastMessage, toastVisible, toast } = useToast();
  const { closeSocket, sendEvent, connectSocket } = useWebSocketConnection();

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const chatIdRef = useRef(1);
  const autoStartScheduledRef = useRef(false);
  // Ref-based callbacks to avoid stale closures inside WS handlers
  const handleRoundResultRef = useRef<((winnerRole: Role, opponentSec: string, wg: WrongGuesses) => void) | null>(null);
  const startCategoryPickRef = useRef<(() => void) | null>(null);

  // Detect URL room code
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) gameState.setRoomCode(roomParam.toUpperCase());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const appendMessage = useCallback((text: string, type: "hint" | "guess" | "system" | "correct", label?: string) => {
    gameStateRef.current.setChatMessages((prev) => [
      ...prev,
      { id: chatIdRef.current++, text, type, label },
    ]);
  }, []);

  // ─── Game event handler (called from WS closure — use refs for callbacks) ───
  const handleGameEvent = useCallback(
    (event: ClientGameEvent) => {
      const state = gameStateRef.current;
      switch (event.type) {

        // ── Category phase ──────────────────────────────────────────────────
        case "categoryChosen":
          // Received only by P2. Adopt category + mark both ready.
          state.setMyCategory(event.payload.category);
          state.setIReady(true);
          state.setOpponentReady(true);
          break;

        // ── Secret phase ─────────────────────────────────────────────────────
        case "secretReady":
          // Opponent locked in their secret
          state.setOpponentReady(true);
          break;

        case "gameStart":
          // Owner started the game — P2 navigates to arena
          setScreen("arena");
          appendMessage("Game started! P1 goes first.", "system");
          break;

        // ── Arena: hint flow ─────────────────────────────────────────────────
        case "requestHint": {
          // Requester asked for a hint → I must give one
          const { requester } = event.payload;
          const requesterName = state.names[requester] || requester;
          appendMessage(event.payload.text || "Can I get a hint?", "system", `${requesterName} • Asked for hint`);
          // The one responsible for giving a hint = the other player
          state.setAskerRole(requester);
          state.setActiveRole(requester === "P1" ? "P2" : "P1");
          state.setTurnMode("give_hint");
          break;
        }

        case "hint": {
          // A hint was given
          const { text, label, player, requester } = event.payload;
          const playerName = state.names[player] || player;
          appendMessage(text, "hint", `${playerName} • ${label}`);
          state.setHintCounts((prev) => ({ ...prev, [player]: prev[player] + 1 }));
          
          // After giving the hint, the turn stays with the hint giver (who can now ask/guess)
          state.setActiveRole(player);
          state.setTurnMode("take_turn");
          break;
        }

        // ── Arena: guess flow ─────────────────────────────────────────────────
        case "guess": {
          // A guess was made — the SECRET HOLDER evaluates it.
          const { text, player: guesserRole } = event.payload;
          const guesserName = state.names[guesserRole] || guesserRole;
          appendMessage(text, "guess", `${guesserName} • Guess`);

          // Only the secret holder (= non-guesser) evaluates
          if (state.myRoleRef.current !== guesserRole) {
            const correct = normalizeText(text) === normalizeText(state.mySecret);
            if (correct) {
              sendEvent({
                type: "guessResult",
                payload: {
                  correct: true,
                  player: guesserRole,
                  secret: state.mySecret,
                  wrongGuesses: state.wrongGuesses,
                },
              });
            } else {
              const updated: WrongGuesses = {
                ...state.wrongGuesses,
                [guesserRole]: state.wrongGuesses[guesserRole] + 1,
              };
              sendEvent({
                type: "guessResult",
                payload: {
                  correct: false,
                  player: guesserRole,
                  secret: state.mySecret,
                  wrongGuesses: updated,
                },
              });
            }
          }
          break;
        }

        case "guessResult": {
          const { correct, player: guesserRole, secret, wrongGuesses: wg } = event.payload;
          // Always update wrong guess counts from the payload
          state.setWrongGuesses(wg);

          if (correct) {
            if (guesserRole === state.myRoleRef.current) {
              // I won! Reveal my secret to the loser.
              sendEvent({
                type: "revealSecret",
                payload: { secret: state.mySecret, player: state.myRoleRef.current },
              });
            }
            handleRoundResultRef.current?.(guesserRole, secret, wg);
          } else {
            appendMessage("Wrong guess! Turn passes to opponent.", "system");
            const nextTurn: Role = guesserRole === "P1" ? "P2" : "P1";
            state.setActiveRole(nextTurn);
            state.setTurnMode("take_turn");
          }
          break;
        }

        case "revealSecret": {
          const { secret, player } = event.payload;
          if (player !== state.myRoleRef.current) {
            state.setOpponentSecret(secret);
          }
          break;
        }

        // ── Round flow ────────────────────────────────────────────────────────
        case "roundNext":
          state.setRound((v) => v + 1);
          state.resetRoundState();
          state.setWrongGuesses({ P1: 0, P2: 0 });
          startCategoryPickRef.current?.();
          break;

        case "ping":
          break;
      }
    },
    [appendMessage, sendEvent, setScreen],
  );

  // ─── Round result ─────────────────────────────────────────────────────────
  const handleRoundResult = useCallback(
    (winnerRole: Role, revealedSecret: string, wg: WrongGuesses) => {
      const state = gameStateRef.current;
      const winnerName = state.names[winnerRole] || winnerRole;
      appendMessage(`🎉 ${winnerName} guessed correctly!`, "correct");
      appendMessage(`✅ The secret was "${revealedSecret}"`, "correct");
      state.setWrongGuesses(wg);
      state.setWinnerRole(winnerRole);
      
      if (state.myRoleRef.current === winnerRole) {
        state.setOpponentSecret(revealedSecret);
      }
      window.setTimeout(() => setScreen("win"), 800);
    },
    [appendMessage, setScreen],
  );

  // ─── Screen transitions ───────────────────────────────────────────────────
  const startCategoryPick = useCallback(() => {
    gameState.setIReady(false);
    gameState.setOpponentReady(false);
    gameState.setMyCategory("");
    setScreen("category");
  }, [gameState, setScreen]);

  const startArena = useCallback(() => {
    gameState.setChatMessages([]);
    gameState.setAskerRole("P1");
    gameState.setActiveRole("P1");
    gameState.setTurnMode("take_turn");
    appendMessage("Game started! P1 goes first.", "system");
    setScreen("arena");
  }, [gameState, appendMessage, setScreen]);

  // Keep refs current
  useEffect(() => {
    handleRoundResultRef.current = handleRoundResult;
    startCategoryPickRef.current = startCategoryPick;
  }, [handleRoundResult, startCategoryPick]);

  // ─── Category → Secret transition ─────────────────────────────────────────
  useEffect(() => {
    if (screen === "category" && gameState.iReady && gameState.opponentReady) {
      const t = window.setTimeout(() => {
        gameState.setIReady(false);
        gameState.setOpponentReady(false);
        gameState.setSecretInput("");
        setScreen("secret");
      }, 450);
      return () => window.clearTimeout(t);
    }
  }, [gameState.iReady, gameState.opponentReady, screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── WS connection ────────────────────────────────────────────────────────
  const handleConnect = useCallback(
    (code: string, playerName: string) => {
      autoStartScheduledRef.current = false;
      closeSocket();

      connectSocket(
        code,
        playerName,
        (roomCode, role, players) => {
          gameState.setRoomCode(roomCode);
          gameState.setMyRole(role); // updates both state + ref
          const playerMap: Record<Role, string> = { P1: "", P2: "" };
          for (const p of players) playerMap[p.role] = p.name;
          gameState.setNames(playerMap);
        },
        (players) => {
          const playerMap: Record<Role, string> = { P1: "", P2: "" };
          for (const p of players) playerMap[p.role] = p.name;
          gameState.setNames(playerMap);

          // P1: room-created → waiting → category
          if (screenRef.current === "room-created" && players.length === 2 && !autoStartScheduledRef.current) {
            autoStartScheduledRef.current = true;
            window.setTimeout(() => {
              setScreen("waiting");
              window.setTimeout(() => startCategoryPick(), 600);
            }, 300);
          }

          // P2: already on waiting → category
          if (screenRef.current === "waiting" && players.length === 2 && !autoStartScheduledRef.current) {
            autoStartScheduledRef.current = true;
            window.setTimeout(() => startCategoryPick(), 600);
          }
        },
        (name) => { toast(`${name} joined`, 1800); },
        handleGameEvent,
        (message) => { toast(message, 3000); },
        () => { toast("Connected", 1500); },
        (shouldNotify) => {
          if (shouldNotify && screenRef.current !== "name" && screenRef.current !== "room-choice" && screenRef.current !== "join-input") {
            toast("Disconnected", 2200);
          }
        },
      );
    },
    [gameState, closeSocket, connectSocket, handleGameEvent, toast, setScreen, startCategoryPick, screenRef],
  );

  // ─── Room actions ─────────────────────────────────────────────────────────
  const createRoom = useCallback((name: string) => {
    gameState.setMyName(name);
    gameState.setNames({ P1: name, P2: "" });
    gameState.setMyRole("P1");
    const code = generateCode();
    gameState.setRoomCode(code);
    handleConnect(code, name);
    setScreen("room-created");
  }, [gameState, handleConnect, setScreen]);

  const joinRoom = useCallback((name: string, code: string) => {
    gameState.setMyName(name);
    gameState.setMyRole("P2");
    gameState.setNames((prev) => ({ ...prev, P2: name }));
    gameState.setRoomCode(code);
    handleConnect(code, name);
    setScreen("waiting");
  }, [gameState, handleConnect, setScreen]);

  const goBack = useCallback(() => {
    autoStartScheduledRef.current = false;
    closeSocket();
    setScreen("room-choice");
  }, [closeSocket, setScreen]);

  const goHome = useCallback(() => {
    autoStartScheduledRef.current = false;
    closeSocket();
    gameState.resetGameState();
    gameState.setPlayerNameInput("");
    gameState.setJoinCodeInput("");
    setScreen("name");
  }, [gameState, closeSocket, setScreen]);

  // ─── Category pick (P1 only) ──────────────────────────────────────────────
  const pickCategory = useCallback((category: CategoryKey) => {
    gameState.setMyCategory(category);
    gameState.setIReady(true);
    gameState.setOpponentReady(true); // P1 self-confirms; P2 confirms via event
    sendEvent({ type: "categoryChosen", payload: { category } });
  }, [gameState, sendEvent]);

  // ─── Secret phase actions ─────────────────────────────────────────────────
  const confirmSecret = useCallback(() => {
    const value = gameState.secretInput.trim();
    if (!value) { toast("Type your secret first"); return; }
    gameState.setMySecret(value);
    gameState.setIReady(true);
    sendEvent({ type: "secretReady", payload: { secret: value } });
  }, [gameState, sendEvent, toast]);

  const startGame = useCallback(() => {
    // Only P1 / owner calls this
    sendEvent({ type: "gameStart" });
    startArena();
  }, [sendEvent, startArena]);

  // ─── Arena actions ────────────────────────────────────────────────────────
  const sendHint = useCallback(() => {
    const value = gameState.messageInput.trim();
    if (!value) return;

    const state = gameStateRef.current;

    if (state.turnMode === "take_turn" && state.activeRole === state.myRoleRef.current) {
      // Asking for a hint
      state.setMessageInput("");
      const myName = state.names[state.myRoleRef.current] || state.myRoleRef.current;
      appendMessage(value, "system", `${myName} • Asked for hint`);
      state.setAskerRole(state.myRoleRef.current);
      const opponent: Role = state.myRoleRef.current === "P1" ? "P2" : "P1";
      state.setActiveRole(opponent);
      state.setTurnMode("give_hint");
      sendEvent({ type: "requestHint", payload: { text: value, requester: state.myRoleRef.current } });
      return;
    }

    if (state.turnMode === "give_hint" && state.activeRole === state.myRoleRef.current) {
      // Giving a hint
      const nextCount = (state.hintCounts[state.myRoleRef.current] ?? 0) + 1;
      state.setHintCounts((prev) => ({ ...prev, [state.myRoleRef.current]: nextCount }));
      state.setMessageInput("");
      const myName = state.names[state.myRoleRef.current] || state.myRoleRef.current;
      appendMessage(value, "hint", `${myName} • Hint #${nextCount}`);

      // After giving hint, turn stays with me (the person who just gave the hint)
      state.setActiveRole(state.myRoleRef.current);
      state.setTurnMode("take_turn");

      sendEvent({
        type: "hint",
        payload: {
          text: value,
          label: `Hint #${nextCount}`,
          player: state.myRoleRef.current,
          requester: state.askerRole,
        },
      });
    }
  }, [gameState, appendMessage, sendEvent]);

  const sendGuess = useCallback(() => {
    const value = gameState.messageInput.trim();
    if (!value) return;
    if (gameState.turnMode !== "take_turn" || gameState.activeRole !== gameState.myRoleRef.current) {
      toast("Not your turn to guess");
      return;
    }
    gameState.setMessageInput("");
    const myName = gameState.names[gameState.myRoleRef.current] || gameState.myRoleRef.current;
    appendMessage(value, "guess", `${myName} • Guess`);
    sendEvent({ type: "guess", payload: { text: value, player: gameState.myRoleRef.current } });
  }, [gameState, appendMessage, sendEvent, toast]);

  // ─── Play again (owner only) ──────────────────────────────────────────────
  const playAgain = useCallback(() => {
    gameState.setRound((v) => v + 1);
    gameState.setWrongGuesses({ P1: 0, P2: 0 });
    gameState.resetRoundState();
    sendEvent({ type: "roundNext" });
    startCategoryPick();
  }, [gameState, sendEvent, startCategoryPick]);

  useEffect(() => {
    return () => { closeSocket(); };
  }, [closeSocket]);

  return (
    <div className="mindmatch-app">
      <ThemeToggle />

      <div id="toast" className={toastVisible ? "show" : ""}>
        {toastMessage}
      </div>

      <div className="confetti-wrap">{gameState.showConfetti ? <div className="confetti-piece confetti-1" /> : null}</div>

      <RoomFlowContainer
        screen={screen}
        playerNameInput={gameState.playerNameInput}
        setPlayerNameInput={gameState.setPlayerNameInput}
        joinCodeInput={gameState.joinCodeInput}
        setJoinCodeInput={gameState.setJoinCodeInput}
        roomCode={gameState.roomCode}
        names={gameState.names}
        myRole={gameState.myRole}
        myName={gameState.myName}
        setScreen={setScreen}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
      />

      <GameFlowContainer
        screen={screen}
        roomCode={gameState.roomCode}
        names={gameState.names}
        myRole={gameState.myRole}
          myName={gameState.myName}
          winnerRole={gameState.winnerRole}
          wrongGuesses={gameState.wrongGuesses}
          round={gameState.round}
        myCategory={gameState.myCategory}
        mySecret={gameState.mySecret}
        opponentSecret={gameState.opponentSecret}
        secretInput={gameState.secretInput}
        setSecretInput={gameState.setSecretInput}
        iConfirmed={gameState.iReady}
        opponentConfirmed={gameState.opponentReady}
        hintCounts={gameState.hintCounts}
        chatMessages={gameState.chatMessages}
        messageInput={gameState.messageInput}
        setMessageInput={gameState.setMessageInput}
        activeRole={gameState.activeRole}
        turnMode={gameState.turnMode}
        onPickCategory={pickCategory}
        onConfirmSecret={confirmSecret}
        onStartGame={startGame}
        onSendHint={sendHint}
        onSendGuess={sendGuess}
        onPlayAgain={playAgain}
        onGoHome={goHome}
        onBack={goBack}
      />
    </div>
  );
}