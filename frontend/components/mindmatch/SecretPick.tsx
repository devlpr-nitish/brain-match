"use client";

import type { Dispatch, SetStateAction } from "react";
import { Lock, Play, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

type SecretPickProps = {
  secretHint: string;
  secretInput: string;
  setSecretInput: Dispatch<SetStateAction<string>>;
  iConfirmed: boolean;       // I've locked in my secret
  opponentConfirmed: boolean; // opponent locked in theirs
  isOwner: boolean;
  onConfirmSecret: () => void;
  onStartGame: () => void;
};

export function SecretPick({
  secretHint,
  secretInput,
  setSecretInput,
  iConfirmed,
  opponentConfirmed,
  isOwner,
  onConfirmSecret,
  onStartGame,
}: SecretPickProps) {
  const hasInput = !!secretInput.trim();
  const bothReady = iConfirmed && opponentConfirmed;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />
      <div className="relative z-10 anim-slide-up flex flex-col items-center gap-6 w-full max-w-[400px] px-4 sm:px-6 py-8 mx-auto">

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
          className="w-full bg-white dark:bg-[#0f0f0f] border border-[var(--border)] rounded-2xl flex flex-col gap-5 p-6 sm:p-7"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
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
              onKeyDown={(e) => { if (e.key === "Enter" && !iConfirmed) onConfirmSecret(); }}
              disabled={iConfirmed}
              className="bg-[var(--input-bg)] text-[var(--text)] placeholder:text-[var(--muted)]"
              style={{ borderColor: iConfirmed ? "var(--green)" : hasInput ? "var(--pink)" : "var(--border)" }}
            />
          </div>

          {/* Lock In button — only before confirmed */}
          {!iConfirmed && (
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
          )}

          {/* Confirmed badge */}
          {iConfirmed && (
            <div className="flex items-center gap-2 text-sm text-[var(--green)] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[var(--green)] inline-block" /> Secret locked ✓
            </div>
          )}
        </div>

        {/* Status panel below card */}
        {iConfirmed && (
          <div className="w-full flex flex-col items-center gap-3">
            {/* Opponent status */}
            {!opponentConfirmed && (
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Loader2 size={14} className="animate-spin" /> Waiting for opponent to lock in…
              </div>
            )}

            {/* Both ready — owner sees Start button, P2 sees waiting */}
            {bothReady && isOwner && (
              <button
                onClick={onStartGame}
                className="relative flex items-center gap-2 rounded-xl px-10 py-3 font-bold text-sm tracking-widest uppercase
                  text-white transition-all overflow-hidden
                  bg-[linear-gradient(135deg,var(--cyan),var(--purple))]
                  shadow-[0_0_22px_rgba(0,229,255,0.25)]
                  border border-white/15 hover:-translate-y-px hover:brightness-110
                  dark:bg-[linear-gradient(135deg,var(--cyan),var(--pink))]
                  dark:shadow-[0_0_30px_rgba(0,229,255,0.45)]
                  dark:border-white/[0.06]"
              >
                {/* Glare + neon bloom */}
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_60%)]"
                />
                <span
                  aria-hidden
                  className="absolute -inset-12 opacity-40 bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.35),transparent_62%)] blur-[18px]
                    dark:opacity-30"
                />
                <span className="relative flex items-center gap-2">
                  <Play size={16} /> Start Game
                </span>
              </button>
            )}

            {bothReady && !isOwner && (
              <div className="flex items-center gap-2 text-sm text-[var(--cyan)]">
                <span className="w-2 h-2 rounded-full bg-[var(--cyan)] anim-pulse inline-block" />
                Waiting for host to start the game…
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
