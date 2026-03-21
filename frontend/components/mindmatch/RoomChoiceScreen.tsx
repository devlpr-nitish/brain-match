"use client";

import { PlusCircle, Users, ChevronLeft, Swords } from "lucide-react";

type RoomChoiceScreenProps = {
  playerName: string;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onBack: () => void;
};

export function RoomChoiceScreen({ playerName, onCreateRoom, onJoinRoom, onBack }: RoomChoiceScreenProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />

      <div className="relative z-10 anim-slide-up w-full flex flex-col gap-5" style={{ maxWidth: "380px", padding: "1.5rem" }}>

        <div className="text-center mb-2">
          <div
            className="font-[var(--font-bebas-neue)] tracking-widest text-[var(--cyan)] anim-flicker"
            style={{ fontSize: "clamp(2.5rem,8vw,3.5rem)", textShadow: "var(--glow-cyan)" }}
          >
            Brain Match
          </div>
          <div className="text-xs tracking-[4px] uppercase text-[var(--muted)] mt-1">The Hint Duel</div>
        </div>

        <div
          className="bg-white dark:bg-[#0f0f0f] border border-[var(--border)] rounded-2xl flex flex-col gap-4"
          style={{ padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <Swords size={20} className="text-[var(--pink)]" />
            <h2 className="font-[var(--font-bebas-neue)] text-[1.8rem] tracking-[3px] text-[var(--pink)]">
              Hey, {playerName}!
            </h2>
          </div>

          <p className="text-sm text-[var(--muted)]">Choose your battle mode</p>

          <button
            onClick={onCreateRoom}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all
              bg-[var(--cyan)] text-white dark:text-black
              dark:[box-shadow:0_0_16px_rgba(0,229,255,0.4)]
              hover:brightness-110 hover:-translate-y-px"
          >
            <PlusCircle size={18} /> Create Room
          </button>

          <div className="flex items-center gap-4 text-[var(--muted)] text-xs tracking-[3px]">
            <div className="flex-1 h-px bg-[var(--border)]" />OR<div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <button
            onClick={onJoinRoom}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all
              bg-transparent border border-[var(--pink)] text-[var(--pink)]
              hover:bg-[var(--pink)]/10 hover:-translate-y-px"
          >
            <Users size={18} /> Join Room
          </button>

          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all
              bg-transparent border border-[var(--border)] text-[var(--muted)]
              hover:border-[var(--cyan)] hover:text-[var(--text)]"
          >
            <ChevronLeft size={15} /> Change Name
          </button>
        </div>
      </div>
    </div>
  );
}
