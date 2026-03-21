"use client";

import type { Dispatch, SetStateAction } from "react";
import { Lock, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";

type SecretPickProps = {
  secretHint: string;
  secretInput: string;
  setSecretInput: Dispatch<SetStateAction<string>>;
  myMaxHints: number;
  waitingForOpponent: boolean;
  onSetHints: (count: number) => void;
  onConfirmSecret: () => void;
};

export function SecretPick({ secretHint, secretInput, setSecretInput, myMaxHints, waitingForOpponent, onSetHints, onConfirmSecret }: SecretPickProps) {
  const hasInput = !!secretInput.trim();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />

      <div className="relative z-10 anim-slide-up flex flex-col items-center gap-6 w-full" style={{ maxWidth: "400px", padding: "2rem 1.5rem" }}>

        <div className="text-center">
          <div
            className="font-[var(--font-bebas-neue)] tracking-widest text-[var(--pink)]"
            style={{ fontSize: "clamp(2.5rem,7vw,4.5rem)", textShadow: "var(--glow-pink)" }}
          >
            Your Secret
          </div>
          <p className="text-xs tracking-widest uppercase text-[var(--muted)] mt-2">
            Pick something — your opponent will try to guess it
          </p>
        </div>

        <div
          className="w-full bg-white dark:bg-[#0f0f0f] border border-[var(--border)] rounded-2xl flex flex-col gap-5"
          style={{ padding: "1.75rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          {/* Category label */}
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-[var(--pink)]" />
            <span className="text-[0.65rem] tracking-[3px] uppercase text-[var(--pink)] font-semibold">{secretHint}</span>
          </div>

          {/* Input */}
          <div className="flex flex-col gap-1.5">
            <Input
              type="text" placeholder="Type it here…" maxLength={50}
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onConfirmSecret(); }}
              className="bg-[var(--input-bg)] text-[var(--text)] placeholder:text-[var(--muted)]"
              style={{ borderColor: hasInput ? "var(--pink)" : "var(--border)" }}
            />
          </div>

          {/* Hint count */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-[var(--yellow)]" />
              <span className="text-[0.65rem] tracking-[3px] uppercase text-[var(--muted)]">How many hints will you give?</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[3, 5, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => onSetHints(n)}
                  className="rounded-full text-sm font-semibold tracking-wide transition-all border"
                  style={{
                    padding: "0.375rem 1rem",
                    borderColor: myMaxHints === n ? "var(--purple)" : "var(--border)",
                    color: myMaxHints === n ? "var(--purple)" : "var(--muted)",
                    background: myMaxHints === n ? "rgba(177,107,255,0.08)" : "transparent",
                  }}
                >
                  {n} hints
                </button>
              ))}
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={onConfirmSecret}
            disabled={!hasInput}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all"
            style={{
              background: hasInput ? "var(--pink)" : "var(--surface)",
              color: hasInput ? "white" : "var(--muted)",
              border: hasInput ? "none" : "1px solid var(--border)",
              opacity: hasInput ? 1 : 0.4,
              cursor: hasInput ? "pointer" : "not-allowed",
            }}
          >
            <Lock size={15} /> Lock It In
          </button>
        </div>

        {waitingForOpponent && (
          <div className="flex items-center gap-2 text-sm text-[var(--green)]">
            <span className="w-2 h-2 rounded-full bg-[var(--green)] anim-pulse inline-block" /> Waiting for opponent…
          </div>
        )}
      </div>
    </div>
  );
}
