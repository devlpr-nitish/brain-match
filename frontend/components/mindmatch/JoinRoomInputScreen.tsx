"use client";

import { Hash, ArrowLeft, LogIn, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type JoinRoomInputScreenProps = {
  joinCodeInput: string;
  setJoinCodeInput: (code: string) => void;
  onJoinRoom: () => void;
  onBack: () => void;
  isLoading?: boolean;
};

export function JoinRoomInputScreen({ joinCodeInput, setJoinCodeInput, onJoinRoom, onBack, isLoading }: JoinRoomInputScreenProps) {
  const isReady = joinCodeInput.length === 4 && !isLoading;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />
      <div className="relative z-10 anim-slide-up w-full max-w-[400px] flex flex-col gap-5 px-4 sm:px-6 py-8 mx-auto">

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
          className="bg-white dark:bg-[#0f0f0f] border border-[var(--border)] rounded-2xl flex flex-col gap-5 p-6 sm:p-8"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <Hash size={20} className="text-[var(--pink)]" />
            <h2 className="font-[var(--font-bebas-neue)] text-[1.8rem] tracking-[3px] text-[var(--pink)]">Join Room</h2>
          </div>

          <p className="text-sm text-[var(--muted)] text-center">Enter the 4-letter code from your opponent</p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.6rem] tracking-[3px] uppercase text-[var(--muted)]">Room Code</label>
            <Input
              type="text" placeholder="ABCD" maxLength={4} autoFocus
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === "Enter" && isReady) onJoinRoom(); }}
              disabled={isLoading}
              className="text-[var(--pink)] text-center text-3xl tracking-[10px] uppercase font-[var(--font-dm-mono)] bg-[var(--input-bg)]"
              style={{ borderColor: isReady ? "var(--pink)" : "var(--border)", padding: "0.75rem" }}
            />
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {[0,1,2,3].map(i => (
              <div key={i} className="w-2 h-2 rounded-full transition-all duration-200"
                style={{ background: i < joinCodeInput.length ? "var(--pink)" : "var(--border)" }} />
            ))}
          </div>

          <button
            onClick={onJoinRoom}
            disabled={!isReady}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all"
            style={{
              background: isReady ? "var(--pink)" : "var(--surface)",
              color: isReady ? "white" : "var(--muted)",
              border: isReady ? "none" : "1px solid var(--border)",
              opacity: isReady ? 1 : 0.4,
              cursor: isReady ? "pointer" : "not-allowed",
            }}
          >
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Joining…</> : <><LogIn size={16} /> Join Arena</>}
          </button>

          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all
              bg-transparent border border-[var(--border)] text-[var(--muted)]
              hover:border-[var(--cyan)] hover:text-[var(--text)]"
          >
            <ArrowLeft size={15} /> Back
          </button>
        </div>
      </div>
    </div>
  );
}
