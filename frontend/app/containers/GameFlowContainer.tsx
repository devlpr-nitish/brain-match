"use client";

import type { Dispatch, SetStateAction } from "react";
import { CategoryPick } from "@/components/mindmatch/CategoryPick";
import { GameArena } from "@/components/mindmatch/GameArena";
import { SecretPick } from "@/components/mindmatch/SecretPick";
import { WaitingRoom } from "@/components/mindmatch/WaitingRoom";
import { WinScreen } from "@/components/mindmatch/WinScreen";
import type { CategoryKey, ChatMessage, Names, Role, TurnMode, WrongGuesses } from "@/app/types/types";

type GameFlowContainerProps = {
  screen: string;
  roomCode: string;
  names: Names;
  myRole: Role;
  myName: string;
  winnerRole: Role | null;
  wrongGuesses: WrongGuesses;
  round: number;
  myCategory: CategoryKey | "";
  mySecret: string;
  opponentSecret: string;
  secretInput: string;
  setSecretInput: Dispatch<SetStateAction<string>>;
  iConfirmed: boolean;
  opponentConfirmed: boolean;
  hintCounts: Record<Role, number>;
  chatMessages: ChatMessage[];
  messageInput: string;
  setMessageInput: (value: string) => void;
  activeRole: Role;
  turnMode: TurnMode;
  onPickCategory: (category: CategoryKey) => void;
  onConfirmSecret: () => void;
  onStartGame: () => void;
  onSendHint: () => void;
  onSendGuess: () => void;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onBack: () => void;
};

export function GameFlowContainer({
  screen, roomCode, names, myRole, myName, winnerRole, wrongGuesses, round,
  myCategory, mySecret, opponentSecret, secretInput, setSecretInput,
  iConfirmed, opponentConfirmed, hintCounts,
  chatMessages, messageInput, setMessageInput,
  activeRole, turnMode,
  onPickCategory, onConfirmSecret, onStartGame,
  onSendHint, onSendGuess, onPlayAgain, onGoHome, onBack,
}: GameFlowContainerProps) {
  const isOwner = myRole === "P1";
  const waitingSlot1Name = names.P1 || (myRole === "P1" ? myName : "Waiting...");
  const waitingSlot2Name = names.P2 || (myRole === "P2" ? myName : "Waiting...");

  const secretHint = myCategory
    ? ({
        numbers: "Pick any number between 1 and 1,000",
        objects: "Type any object or word",
        person: "Name a famous person (real or fictional)",
        movie: "Name a movie, show, or series",
      }[myCategory] ?? "Enter your secret")
    : "Enter your secret";

  return (
    <>
      {screen === "waiting" ? (
        <WaitingRoom
          roomCode={roomCode}
          slot1Name={waitingSlot1Name}
          slot2Name={waitingSlot2Name}
          slot2Filled={Boolean(names.P1 && names.P2)}
          waitingMessage={names.P1 && names.P2 ? "Players connected. Starting…" : "Waiting for opponent to join…"}
          onBack={onBack}
        />
      ) : null}

      {screen === "category" ? (
        <CategoryPick
          selectedCategory={myCategory}
          waitingForOpponent={iConfirmed}
          isOwner={isOwner}
          onPick={onPickCategory}
        />
      ) : null}

      {screen === "secret" ? (
        <SecretPick
          secretHint={secretHint}
          secretInput={secretInput}
          setSecretInput={setSecretInput}
          iConfirmed={iConfirmed}
          opponentConfirmed={opponentConfirmed}
          isOwner={isOwner}
          onConfirmSecret={onConfirmSecret}
          onStartGame={onStartGame}
        />
      ) : null}

      {screen === "arena" ? (
        <GameArena
          myRole={myRole}
          names={names}
          wrongGuesses={wrongGuesses}
          round={round}
          mySecret={mySecret}
          hintCounts={hintCounts}
          chatMessages={chatMessages}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          activeRole={activeRole}
          turnMode={turnMode}
          onSendHint={onSendHint}
          onSendGuess={onSendGuess}
        />
      ) : null}

      {screen === "win" ? (
        <WinScreen
          myRole={myRole}
          myName={myName}
          names={names}
          wrongGuesses={wrongGuesses}
          mySecret={mySecret}
          opponentSecret={opponentSecret}
          category={myCategory}
          isOwner={isOwner}
          winnerRole={winnerRole}
          onPlayAgain={onPlayAgain}
          onGoHome={onGoHome}
        />
      ) : null}
    </>
  );
}
