"use client";

import type { Names, Role, Scores } from "@/app/types";
import { Trophy, RefreshCw, Home, Medal, Crown } from "lucide-react";

type WinScreenProps = {
  myRole: Role;
  myName: string;
  names: Names;
  scores: Scores;
  onPlayAgain: () => void;
  onGoHome: () => void;
};

export function WinScreen({ myRole, myName, names, scores, onPlayAgain, onGoHome }: WinScreenProps) {
  const sorted = (["P1", "P2"] as Role[]).sort((a, b) => scores[b] - scores[a]);
  const champion = sorted[0];
  const iWon = champion === myRole;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />

      <div className="relative z-10 anim-slide-up flex flex-col items-center gap-6 w-full" style={{ maxWidth: "400px", padding: "2rem 1.5rem" }}>

        {/* Trophy */}
        <div className={iWon ? "anim-float" : ""}>
          {iWon
            ? <Crown size={72} className="text-[var(--yellow)]" style={{ filter: "drop-shadow(0 0 16px rgba(255,215,0,0.7))" }} />
            : <Medal size={72} className="text-[var(--muted)]" />}
        </div>

        {/* Title */}
        <div
          className="font-[var(--font-bebas-neue)] tracking-widest text-[var(--yellow)]"
          style={{ fontSize: "clamp(3rem,10vw,5.5rem)", textShadow: iWon ? "0 0 20px rgba(255,215,0,0.6)" : "none" }}
        >
          {iWon ? "🏆 You Win!" : "💀 You Lose!"}
        </div>

        <p className="text-base text-[var(--muted)] text-center -mt-2">
          {iWon ? `Flawless game, ${myName}!` : `${names[champion]} takes the crown this time!`}
        </p>

        {/* Leaderboard */}
        <div
          className="w-full bg-white dark:bg-[#0f0f0f] border border-[var(--border)] rounded-2xl flex flex-col gap-4"
          style={{ padding: "1.75rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center gap-2 font-[var(--font-bebas-neue)] text-2xl tracking-[3px] text-[var(--yellow)]">
            <Trophy size={20} className="text-[var(--yellow)]" /> Final Scores
          </div>

          {sorted.map((role, idx) => (
            <div key={role} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-none">
              <div className="font-[var(--font-dm-mono)] text-sm text-[var(--muted)] w-7">#{idx + 1}</div>
              <div className="flex-1 flex items-center gap-2 font-semibold">
                {idx === 0 ? <Crown size={14} className="text-[var(--yellow)]" /> : <Medal size={14} className="text-[var(--muted)]" />}
                {names[role]}
              </div>
              <div
                className="font-[var(--font-dm-mono)] font-bold"
                style={{ color: idx === 0 ? "var(--yellow)" : "var(--muted)" }}
              >
                {scores[role]} pts
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 rounded-xl font-bold text-sm tracking-widest uppercase transition-all
              bg-[var(--cyan)] text-white dark:text-black
              dark:[box-shadow:0_0_16px_rgba(0,229,255,0.4)]
              hover:brightness-110 hover:-translate-y-px"
            style={{ padding: "0.75rem 1.75rem" }}
          >
            <RefreshCw size={16} /> Play Again
          </button>
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all
              bg-transparent border border-[var(--border)] text-[var(--muted)]
              hover:border-[var(--cyan)] hover:text-[var(--text)]"
            style={{ padding: "0.75rem 1.25rem" }}
          >
            <Home size={16} /> Home
          </button>
        </div>
      </div>
    </div>
  );
}
