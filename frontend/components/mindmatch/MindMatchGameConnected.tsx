"use client";

import { useCallback, useEffect, useRef } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { GameFlowContainer } from "@/app/containers/GameFlowContainer";
import { RoomFlowContainer } from "@/app/containers/RoomFlowContainer";
import { useGameState, useScreenNavigation, useTimer, useToast, useWebSocketConnection } from "@/app/hooks";
import type { CategoryKey, ClientGameEvent, Role } from "@/app/types";

function generateCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function normalizeGuessText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

export function MindMatchGameConnected() {
  const { screen, setScreen, screenRef } = useScreenNavigation("name");
  const gameState = useGameState();
  const { toastMessage, toastVisible, toast } = useToast();
  const { clearTimer, startTimer } = useTimer();
  const { closeSocket, sendEvent, connectSocket } = useWebSocketConnection();

  const chatIdRef = useRef(1);
  const checkingRef = useRef(false);
  const autoStartScheduledRef = useRef(false);
  const urlRoomCodeRef = useRef("");
  const checkGuessRef = useRef<((guess: string, secret: string, role: Role) => void) | null>(null);
  const handleRoundResultRef = useRef<((role: Role, points: number, secret: string) => void) | null>(null);
  const startCategoryPickRef = useRef<(() => void) | null>(null);

  // Detect URL room code
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) {
      urlRoomCodeRef.current = roomParam.toUpperCase();
    }
  }, []);

  const appendMessage = useCallback((text: string, type: "hint" | "guess" | "system" | "correct", label?: string) => {
    gameState.setChatMessages((previous) => [
      ...previous,
      {
        id: chatIdRef.current++,
        text,
        type,
        label,
      },
    ]);
  }, [gameState]);

  const handleGameEvent = useCallback(
    (event: ClientGameEvent) => {
      switch (event.type) {
        case "categoryChosen":
          gameState.setOpponentReady(true);
          break;
        case "secretReady":
          gameState.setOpponentReady(true);
          break;
        case "requestHint":
          appendMessage(
            event.payload.text || "Can I get a hint?",
            "system",
            `${gameState.names[event.payload.requester] || event.payload.requester} • Asked for hint`,
          );
          gameState.setAskerRole(event.payload.requester);
          gameState.setActiveRole(event.payload.requester === "P1" ? "P2" : "P1");
          gameState.setTurnMode("provide_hint");
          break;
        case "hint":
          appendMessage(
            event.payload.text,
            "hint",
            `${gameState.names[event.payload.player] || event.payload.player} • ${event.payload.label}`,
          );
          startTimer((remaining) => gameState.setTimerSeconds(remaining), 30);
          gameState.setAskerRole(event.payload.requester);
          gameState.setActiveRole(event.payload.requester);
          gameState.setTurnMode("guess_after_hint");
          break;
        case "guess":
          appendMessage(event.payload.text, "guess", `${gameState.names[event.payload.player] || event.payload.player} • Guess`);
          checkGuessRef.current?.(event.payload.text, gameState.mySecret, event.payload.player);
          break;
        case "guessResult":
          if (event.payload.correct) {
            handleRoundResultRef.current?.(event.payload.player, event.payload.points, event.payload.secret);
          } else {
            appendMessage("Wrong guess. Try again or ask for a new hint.", "system");
            gameState.setAskerRole(event.payload.player);
            gameState.setActiveRole(event.payload.player);
            gameState.setTurnMode("ask_or_guess");
          }
          break;
        case "roundNext":
          gameState.setRound((value) => value + 1);
          gameState.resetRoundState();
          startCategoryPickRef.current?.();
          break;
        case "ping":
          break;
      }
    },
    [gameState, appendMessage, startTimer],
  );

  const isGuessCorrect = useCallback((guess: string, secret: string) => {
    const strictGuess = normalizeGuessText(guess);
    const strictSecret = normalizeGuessText(secret);
    if (!strictGuess || !strictSecret) return false;

    if (strictGuess === strictSecret) return true;

    const numericGuess = Number(guess.trim());
    const numericSecret = Number(secret.trim());
    if (!Number.isNaN(numericGuess) && !Number.isNaN(numericSecret)) {
      return numericGuess === numericSecret;
    }

    return false;
  }, []);

  const checkGuess = useCallback(
    (guess: string, secret: string, guesserRole: Role) => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      appendMessage("Checking answer…", "system");

      const correct = isGuessCorrect(guess, secret);
      const points = correct ? Math.max(10, gameState.timerSeconds * 3 + (gameState.myMaxHints - gameState.hintCount + 1) * 5) : 0;

      sendEvent({
        type: "guessResult",
        payload: {
          correct,
          player: guesserRole,
          secret,
          points,
        },
      });

      if (correct) {
        handleRoundResultRef.current?.(guesserRole, points, secret);
      } else {
        appendMessage("Wrong guess. Try again or ask for a new hint.", "system");
        gameState.setAskerRole(guesserRole);
        gameState.setActiveRole(guesserRole);
        gameState.setTurnMode("ask_or_guess");
      }

      checkingRef.current = false;
    },
    [gameState, appendMessage, isGuessCorrect, sendEvent],
  );

  const handleRoundResult = useCallback(
    (winnerRole: Role, points: number, secret: string) => {
      clearTimer();
      const winnerName = gameState.names[winnerRole] || winnerRole;

      appendMessage(`🎉 ${winnerName} guessed correctly! +${points} pts`, "correct");
      appendMessage(`✅ Correct! The secret was "${secret}"`, "correct");

      gameState.setScores((previous) => ({ ...previous, [winnerRole]: previous[winnerRole] + points }));

      window.setTimeout(() => {
        const again = window.confirm(`${winnerName} won this round (+${points} pts)!\n\nPlay another round?`);
        if (again) {
          sendEvent({ type: "roundNext" });
          gameState.setRound((value) => value + 1);
          gameState.resetRoundState();
          startCategoryPickRef.current?.();
          return;
        }

        setScreen("win");
        if (winnerRole === gameState.myRole) {
          gameState.setShowConfetti(true);
          window.setTimeout(() => gameState.setShowConfetti(false), 3000);
        }
      }, 800);
    },
    [gameState, appendMessage, clearTimer, sendEvent, setScreen],
  );

  const startCategoryPick = useCallback(() => {
    gameState.setIReady(false);
    gameState.setOpponentReady(false);
    gameState.setMyCategory("");
    setScreen("category");
  }, [gameState, setScreen]);

  const startSecretPick = useCallback(() => {
    gameState.setIReady(false);
    gameState.setOpponentReady(false);
    gameState.setSecretInput("");
    gameState.setMyHintsLeft(gameState.myMaxHints);
    gameState.setHintCount(0);
    setScreen("secret");
  }, [gameState, setScreen]);

  const startArena = useCallback(() => {
    gameState.setChatMessages([]);
    gameState.setAskerRole("P1");
    gameState.setActiveRole("P1");
    gameState.setTurnMode("ask_or_guess");
    appendMessage("Game started. P1 can ask for hint or guess.", "system");
    setScreen("arena");
  }, [gameState, appendMessage, setScreen]);

  // Update refs after callbacks are defined
  useEffect(() => {
    checkGuessRef.current = checkGuess;
    handleRoundResultRef.current = handleRoundResult;
    startCategoryPickRef.current = startCategoryPick;
  }, [checkGuess, handleRoundResult, startCategoryPick]);

  // Socket connection handler
  const handleConnect = useCallback(
    (code: string, playerName: string) => {
      autoStartScheduledRef.current = false;
      closeSocket();

      connectSocket(
        code,
        playerName,
        (roomCode, role, players) => {
          gameState.setRoomCode(roomCode);
          gameState.setMyRole(role);
          const playerMap: Record<Role, string> = { P1: "", P2: "" };
          for (const player of players) {
            playerMap[player.role] = player.name;
          }
          gameState.setNames(playerMap);
        },
        (players) => {
          const playerMap: Record<Role, string> = { P1: "", P2: "" };
          for (const player of players) {
            playerMap[player.role] = player.name;
          }
          gameState.setNames(playerMap);

          if (screenRef.current === "room-created" && players.length === 2 && !autoStartScheduledRef.current) {
            autoStartScheduledRef.current = true;
            window.setTimeout(() => setScreen("waiting"), 300);
          }

          if (screenRef.current === "waiting" && players.length === 2 && !autoStartScheduledRef.current) {
            autoStartScheduledRef.current = true;
            window.setTimeout(() => startCategoryPick(), 600);
          }
        },
        (name) => {
          toast(`${name} joined`, 1800);
        },
        handleGameEvent,
        (message) => {
          toast(message, 3000);
        },
        () => {
          toast("Connected", 1500);
        },
        (shouldNotify) => {
          if (shouldNotify && screenRef.current !== "name" && screenRef.current !== "room-choice" && screenRef.current !== "join-input") {
            toast("Disconnected", 2200);
          }
        },
      );
    },
    [gameState, closeSocket, connectSocket, handleGameEvent, toast, setScreen, startCategoryPick, screenRef],
  );

  const createRoom = useCallback(
    (name: string) => {
      gameState.setMyName(name);
      gameState.setNames({ P1: name, P2: "" });
      gameState.setMyRole("P1");
      const code = generateCode();
      gameState.setRoomCode(code);
      handleConnect(code, name);
      setScreen("room-created");
    },
    [gameState, handleConnect, setScreen],
  );

  const joinRoom = useCallback(
    (name: string, code: string) => {
      gameState.setMyName(name);
      gameState.setMyRole("P2");
      gameState.setNames((previous) => ({ ...previous, P2: name }));
      gameState.setRoomCode(code);
      handleConnect(code, name);
      setScreen("waiting");
    },
    [gameState, handleConnect, setScreen],
  );

  const goBack = useCallback(() => {
    autoStartScheduledRef.current = false;
    closeSocket();
    setScreen("room-choice");
  }, [closeSocket, setScreen]);

  const goHome = useCallback(() => {
    autoStartScheduledRef.current = false;
    closeSocket();
    clearTimer();
    gameState.resetGameState();
    gameState.setPlayerNameInput("");
    gameState.setJoinCodeInput("");
    setScreen("name");
  }, [gameState, clearTimer, closeSocket, setScreen]);

  const pickCategory = useCallback(
    (category: CategoryKey) => {
      gameState.setMyCategory(category);
      gameState.setIReady(true);
      sendEvent({ type: "categoryChosen", payload: { category } });
    },
    [gameState, sendEvent],
  );

  useEffect(() => {
    if (screen === "category" && gameState.iReady && gameState.opponentReady) {
      const timeout = window.setTimeout(() => startSecretPick(), 450);
      return () => window.clearTimeout(timeout);
    }
  }, [gameState.iReady, gameState.opponentReady, screen, startSecretPick]);

  const confirmSecret = useCallback(() => {
    const value = gameState.secretInput.trim();
    if (!value) {
      toast("Type your secret first");
      return;
    }

    gameState.setMySecret(value);
    gameState.setIReady(true);
    sendEvent({ type: "secretReady", payload: { secret: value } });
  }, [gameState, sendEvent, toast]);

  useEffect(() => {
    if (screen === "secret" && gameState.iReady && gameState.opponentReady) {
      const timeout = window.setTimeout(() => startArena(), 450);
      return () => window.clearTimeout(timeout);
    }
  }, [gameState.iReady, gameState.opponentReady, screen, startArena]);

  const sendHint = useCallback(() => {
    const value = gameState.messageInput.trim();
    if (!value) return;
    if (gameState.activeRole !== gameState.myRole) {
      toast("Not your turn");
      return;
    }

    if (gameState.turnMode === "ask_or_guess") {
      gameState.setMessageInput("");
      appendMessage(value, "system", `${gameState.names[gameState.myRole] || gameState.myRole} • Asked for hint`);
      gameState.setAskerRole(gameState.myRole);
      gameState.setActiveRole(gameState.myRole === "P1" ? "P2" : "P1");
      gameState.setTurnMode("provide_hint");
      sendEvent({ type: "requestHint", payload: { text: value, requester: gameState.myRole } });
      return;
    }

    if (gameState.turnMode !== "provide_hint") {
      toast("You can ask for hint or guess now");
      return;
    }

    if (gameState.myHintsLeft <= 0) {
      toast("No hints left");
      return;
    }

    const nextHintCount = gameState.hintCount + 1;
    gameState.setHintCount(nextHintCount);
    gameState.setMyHintsLeft((previous) => previous - 1);
    gameState.setMessageInput("");

    appendMessage(value, "hint", `${gameState.names[gameState.myRole] || gameState.myRole} • Hint #${nextHintCount}`);
    gameState.setActiveRole(gameState.askerRole);
    gameState.setTurnMode("guess_after_hint");
    sendEvent({
      type: "hint",
      payload: {
        text: value,
        label: `Hint #${nextHintCount}`,
        player: gameState.myRole,
        requester: gameState.askerRole,
      },
    });
  }, [gameState, appendMessage, sendEvent, toast]);

  const sendGuess = useCallback(() => {
    const value = gameState.messageInput.trim();
    if (!value) return;
    if (gameState.activeRole !== gameState.myRole || (gameState.turnMode !== "ask_or_guess" && gameState.turnMode !== "guess_after_hint")) {
      toast("Not your turn to guess");
      return;
    }

    clearTimer();
    gameState.setMessageInput("");
    appendMessage(value, "guess", `${gameState.names[gameState.myRole] || gameState.myRole} • Guess`);
    sendEvent({ type: "guess", payload: { text: value, player: gameState.myRole } });
  }, [gameState, appendMessage, clearTimer, sendEvent, toast]);

  const playAgain = useCallback(() => {
    gameState.setScores({ P1: 0, P2: 0 });
    gameState.setRound(1);
    gameState.setShowConfetti(false);
    gameState.resetRoundState();
    startCategoryPick();
  }, [gameState, startCategoryPick]);

  useEffect(() => {
    return () => {
      closeSocket();
      clearTimer();
    };
  }, [clearTimer, closeSocket]);

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
        scores={gameState.scores}
        round={gameState.round}
        myCategory={gameState.myCategory}
        mySecret={gameState.mySecret}
        secretInput={gameState.secretInput}
        setSecretInput={gameState.setSecretInput}
        myMaxHints={gameState.myMaxHints}
        myHintsLeft={gameState.myHintsLeft}
        chatMessages={gameState.chatMessages}
        messageInput={gameState.messageInput}
        setMessageInput={gameState.setMessageInput}
        timerSeconds={gameState.timerSeconds}
        activeRole={gameState.activeRole}
        turnMode={gameState.turnMode}
        iReady={gameState.iReady}
        canSendHint={gameState.myHintsLeft > 0}
        onPickCategory={pickCategory}
        onConfirmSecret={confirmSecret}
        onSetMaxHints={(count) => {
          gameState.setMyMaxHints(count);
          gameState.setMyHintsLeft(count);
        }}
        onSendHint={sendHint}
        onSendGuess={sendGuess}
        onPlayAgain={playAgain}
        onGoHome={goHome}
        onBack={goBack}
      />
    </div>
  );
}