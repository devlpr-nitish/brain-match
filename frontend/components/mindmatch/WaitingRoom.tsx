"use client";

import { Wifi, UserCheck, ArrowLeft, Clock } from "lucide-react";

type WaitingRoomProps = {
  roomCode: string;
  slot1Name: string;
  slot2Name: string;
  slot2Filled: boolean;
  waitingMessage: string;
  onBack: () => void;
};

export function WaitingRoom({ roomCode, slot1Name, slot2Name, slot2Filled, waitingMessage, onBack }: WaitingRoomProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />

      <div className="relative z-10 anim-slide-up flex flex-col items-center gap-6 w-full" style={{ maxWidth: "380px", padding: "1.5rem" }}>

        <div className="flex items-center gap-2 text-[0.65rem] tracking-[3px] uppercase text-[var(--muted)]">
          <Wifi size={14} className="text-[var(--green)]" /> Room Code
        </div>

        <div
          className="font-[var(--font-dm-mono)] tracking-[10px] text-[var(--cyan)] anim-flicker"
          style={{ fontSize: "clamp(3rem,12vw,5rem)", textShadow: "var(--glow-cyan)" }}
        >
          {roomCode || "????"}
        </div>

        <p className="text-sm text-[var(--muted)] text-center">Share this code with your opponent</p>

        {/* Player slots */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div
            className="rounded-xl border border-[var(--green)] bg-white dark:bg-[#0f0f0f] flex flex-col gap-1"
            style={{ padding: "1rem", boxShadow: "0 0 14px rgba(0,255,157,0.1)" }}
          >
            <div className="text-base font-bold text-[var(--green)]">{slot1Name || "—"}</div>
            <div className="flex items-center gap-1 text-[0.6rem] tracking-[2px] uppercase text-[var(--muted)]">
              <span className="w-2 h-2 rounded-full bg-[var(--green)] anim-pulse inline-block" />
              <UserCheck size={10} className="text-[var(--green)]" /> Host
            </div>
          </div>

          <div
            className="rounded-xl border flex flex-col gap-1 bg-white dark:bg-[#0f0f0f]"
            style={{
              padding: "1rem",
              borderColor: slot2Filled ? "var(--green)" : "var(--border)",
              borderStyle: slot2Filled ? "solid" : "dashed",
              boxShadow: slot2Filled ? "0 0 14px rgba(0,255,157,0.1)" : "none",
            }}
          >
            <div className="text-base font-bold" style={{ color: slot2Filled ? "var(--green)" : "var(--muted)" }}>{slot2Name}</div>
            <div className="flex items-center gap-1 text-[0.6rem] tracking-[2px] uppercase text-[var(--muted)]">
              {slot2Filled ? <><UserCheck size={10} className="text-[var(--green)]" /> Connected</> : <><Clock size={10} /> Empty</>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <span className="w-2 h-2 rounded-full bg-[var(--green)] anim-pulse inline-block" />
          {waitingMessage}
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all
            bg-transparent border border-[var(--border)] text-[var(--muted)]
            hover:border-[var(--cyan)] hover:text-[var(--text)]"
          style={{ padding: "0.625rem 1.25rem" }}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    </div>
  );
}
