"use client";

import type { CategoryKey, Names, Role, WrongGuesses } from "@/app/types";
import { Trophy, RefreshCw, Home, Medal, Crown, Eye, Hash, Box, Star, Film, XCircle } from "lucide-react";

const categoryMeta: Record<CategoryKey, { label: string; Icon: React.ComponentType<{ size?: number }> }> = {
  numbers: { label: "Numbers",       Icon: Hash },
  objects: { label: "Object / Word", Icon: Box  },
  person:  { label: "Famous Person", Icon: Star },
  movie:   { label: "Movie / Show",  Icon: Film },
};

type WinScreenProps = {
  myRole: Role;
  myName: string;
  names: Names;
  wrongGuesses: WrongGuesses;
  mySecret: string;
  opponentSecret: string;
  category: CategoryKey | "";
  isOwner: boolean;
  winnerRole: Role | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
};

export function WinScreen({ myRole, myName, names, wrongGuesses, mySecret, opponentSecret, category, isOwner, winnerRole, onPlayAgain, onGoHome }: WinScreenProps) {
  // Winner = whoever guessed correctly first (passed down as winnerRole)
  const champion = winnerRole || "P1"; // Fallback just in case
  const loser = champion === "P1" ? "P2" : "P1";
  const sorted = [champion, loser] as Role[];
  const iWon = champion === myRole;

  const p1Secret = myRole === "P1" ? mySecret : opponentSecret;
  const p2Secret = myRole === "P2" ? mySecret : opponentSecret;

  const catMeta = category ? categoryMeta[category] : null;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />
      <div className="relative z-10 anim-slide-up flex flex-col items-center gap-6 w-full max-w-[460px] px-4 sm:px-6 py-8 mx-auto">

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
          {iWon ? `Brilliant deduction, ${myName}!` : `${names[champion]} cracked it first!`}
        </p>

        {/* Category badge */}
        {catMeta && (
          <div
            className="flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase"
            style={{ borderColor: "var(--cyan)", color: "var(--cyan)", background: "rgba(0,229,255,0.06)" }}
          >
            <catMeta.Icon size={13} /> {catMeta.label}
          </div>
        )}

        {/* Secrets reveal */}
        <div
          className="w-full bg-white dark:bg-[#0f0f0f] border border-[var(--border)] rounded-2xl flex flex-col gap-0"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border)]">
            <Eye size={15} className="text-[var(--yellow)]" />
            <span className="text-xs tracking-[3px] uppercase font-bold text-[var(--muted)]">Secrets Revealed</span>
          </div>
          {(["P1", "P2"] as Role[]).map((role) => {
            const secret = role === "P1" ? p1Secret : p2Secret;
            const isMe = role === myRole;
            return (
              <div key={role} className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] last:border-none" style={{ background: isMe ? "rgba(0,229,255,0.03)" : undefined }}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.6rem] tracking-[2px] uppercase text-[var(--muted)]">{names[role] || role}{isMe ? " (you)" : ""}</span>
                  <span className="font-[var(--font-dm-mono)] font-bold text-base" style={{ color: secret ? "var(--text)" : "var(--muted)" }}>
                    {secret || <span className="text-sm italic opacity-50">not revealed</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: wrongGuesses[role] === 0 ? "var(--green)" : "var(--pink)" }}>
                  <XCircle size={14} /> {wrongGuesses[role]} wrong
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard */}
        <div
          className="w-full bg-white dark:bg-[#0f0f0f] border border-[var(--border)] rounded-2xl flex flex-col gap-4 p-5 sm:p-6"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center gap-2 font-[var(--font-bebas-neue)] text-2xl tracking-[3px] text-[var(--yellow)]">
            <Trophy size={20} className="text-[var(--yellow)]" /> Result
          </div>

          {sorted.map((role, idx) => (
            <div key={role} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-none">
              <div className="font-[var(--font-dm-mono)] text-sm text-[var(--muted)] w-7">#{idx + 1}</div>
              <div className="flex-1 flex items-center gap-2 font-semibold">
                {idx === 0 ? <Crown size={14} className="text-[var(--yellow)]" /> : <Medal size={14} className="text-[var(--muted)]" />}
                {names[role]}
              </div>
              <div
                className="flex items-center gap-1 font-[var(--font-dm-mono)] font-bold text-sm"
                style={{ color: idx === 0 ? "var(--green)" : "var(--muted)" }}
              >
                <XCircle size={12} /> {wrongGuesses[role]} wrong guess{wrongGuesses[role] !== 1 ? "es" : ""}
              </div>
            </div>
          ))}
        </div>

        {/* Actions — only owner can start new round */}
        <div className="flex gap-3 flex-wrap justify-center">
          {isOwner && (
            <button
              onClick={onPlayAgain}
              className="flex items-center gap-2 rounded-xl font-bold text-sm tracking-widest uppercase transition-all bg-[var(--cyan)] text-white dark:text-black hover:brightness-110 hover:-translate-y-px"
              style={{ padding: "0.75rem 1.75rem" }}
            >
              <RefreshCw size={16} /> New Round
            </button>
          )}
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all bg-transparent border border-[var(--border)] text-[var(--muted)] hover:border-[var(--cyan)] hover:text-[var(--text)]"
            style={{ padding: "0.75rem 1.25rem" }}
          >
            <Home size={16} /> Home
          </button>
        </div>
      </div>
    </div>
  );
}
