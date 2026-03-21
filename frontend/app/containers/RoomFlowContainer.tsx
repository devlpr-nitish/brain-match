"use client";

import type { Dispatch, SetStateAction } from "react";
import { JoinRoomInputScreen } from "@/components/mindmatch/JoinRoomInputScreen";
import { NameScreen } from "@/components/mindmatch/NameScreen";
import { RoomChoiceScreen } from "@/components/mindmatch/RoomChoiceScreen";
import { RoomCreatedScreen } from "@/components/mindmatch/RoomCreatedScreen";
import type { Screen } from "@/app/types/types";

type RoomFlowContainerProps = {
  screen: Screen;
  playerNameInput: string;
  setPlayerNameInput: Dispatch<SetStateAction<string>>;
  joinCodeInput: string;
  setJoinCodeInput: Dispatch<SetStateAction<string>>;
  roomCode: string;
  names: Record<string, string>;
  myRole: "P1" | "P2";
  myName: string;
  setScreen: (screen: Screen) => void;
  onCreateRoom: (name: string) => void;
  onJoinRoom: (name: string, code: string) => void;
};

export function RoomFlowContainer({
  screen,
  playerNameInput,
  setPlayerNameInput,
  joinCodeInput,
  setJoinCodeInput,
  roomCode,
  names,
  myRole,
  myName,
  setScreen,
  onCreateRoom,
  onJoinRoom,
}: RoomFlowContainerProps) {
  const waitingSlot1Name = names.P1 || (myRole === "P1" ? myName : "Waiting...");
  const waitingSlot2Name = names.P2 || (myRole === "P2" ? myName : "Waiting...");

  return (
    <>
      {screen === "name" ? (
        <NameScreen
          nameInput={playerNameInput}
          setNameInput={setPlayerNameInput}
          onContinue={() => {
            setScreen("room-choice");
          }}
        />
      ) : null}

      {screen === "room-choice" ? (
        <RoomChoiceScreen
          playerName={playerNameInput}
          onCreateRoom={() => onCreateRoom(playerNameInput)}
          onJoinRoom={() => setScreen("join-input")}
          onBack={() => {
            setPlayerNameInput("");
            setScreen("name");
          }}
        />
      ) : null}

      {screen === "join-input" ? (
        <JoinRoomInputScreen
          joinCodeInput={joinCodeInput}
          setJoinCodeInput={setJoinCodeInput}
          onJoinRoom={() => onJoinRoom(playerNameInput, joinCodeInput)}
          onBack={() => setScreen("room-choice")}
        />
      ) : null}

      {screen === "room-created" ? (
        <RoomCreatedScreen
          roomCode={roomCode}
          slot1Name={waitingSlot1Name}
          slot2Name={waitingSlot2Name}
          slot2Filled={Boolean(names.P1 && names.P2)}
          waitingMessage={names.P1 && names.P2 ? "Players connected. Starting…" : "Waiting for opponent to join…"}
        />
      ) : null}
    </>
  );
}
