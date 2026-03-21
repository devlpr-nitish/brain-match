"use client";

import type { Dispatch, SetStateAction } from "react";
import { Brain, Swords, Hash, Box, Star, Film, ArrowRight, Zap, Shield, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";

type NameScreenProps = {
  nameInput: string;
  setNameInput: Dispatch<SetStateAction<string>>;
  onContinue: () => void;
  isJoining?: boolean;
};

const featureCards = [
  { icon: Hash,  label: "Numbers",       color: "text-[var(--cyan)]" },
  { icon: Box,   label: "Objects",       color: "text-[var(--purple)]" },
  { icon: Star,  label: "Famous People", color: "text-[var(--yellow)]" },
  { icon: Film,  label: "Movies / Shows",color: "text-[var(--pink)]" },
];

const highlights = [
  { icon: Zap,    text: "Real-time duels" },
  { icon: Shield, text: "Strategic hints" },
  { icon: Trophy, text: "Outsmart & win" },
];

export function NameScreen({ nameInput, setNameInput, onContinue, isJoining }: NameScreenProps) {
  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Two-column layout */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row">

        {/* ── LEFT: Hero ── */}
        <div
          className="flex-1 flex flex-col justify-center py-16 md:border-r border-[var(--border)]"
          style={{ padding: "4rem 2rem 4rem 4rem" }}
        >
          <div className="flex flex-col gap-7" style={{ maxWidth: "420px" }}>

            {/* Logo block */}
            <div className="flex flex-row items-center gap-4">
              <Brain
                size={44}
                className="text-[var(--cyan)] shrink-0"
                style={{ filter: "drop-shadow(0 0 8px rgba(0,229,255,0.3))" }}
              />
              <div
                className="font-[var(--font-bebas-neue)] leading-none tracking-widest text-[var(--cyan)]"
                style={{ fontSize: "clamp(3rem,6vw,5rem)", textShadow: "var(--glow-cyan)" }}
              >
                Brain<br />Match
              </div>
            </div>

            {/* Tagline */}
            <p className="text-[0.65rem] tracking-[5px] uppercase text-[var(--muted)] -mt-2">
              The Multiplayer Hint Duel
            </p>

            {/* Description */}
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Challenge a friend in real-time. Give clever hints, guess their secret, earn points. One arena. Two minds.
            </p>

            {/* Feature bullets */}
            <div className="flex flex-col gap-3">
              {highlights.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm font-medium text-[var(--text)]">
                  <Icon size={15} className="text-[var(--cyan)] shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {featureCards.map(({ icon: Icon, label, color }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border border-[var(--border)] bg-white/40 dark:bg-white/5 text-[var(--muted)]"
                >
                  <Icon size={12} className={color} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div
          className="flex-1 flex flex-col justify-center bg-white dark:bg-[#060606]"
          style={{ padding: "4rem" }}
        >
          <div className="flex flex-col gap-6" style={{ maxWidth: "320px", margin: "0 auto" }}>

            {/* Form heading */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Swords size={20} className="text-[var(--cyan)]" />
                <h2 className="font-[var(--font-bebas-neue)] text-3xl tracking-[3px] text-[var(--cyan)]">
                  {isJoining ? "Join Arena" : "Enter Arena"}
                </h2>
              </div>
              <p className="text-xs text-[var(--muted)] ml-8">Pick a name to get started</p>
            </div>

            {/* Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6rem] tracking-[3px] uppercase text-[var(--muted)]">
                Your Gamer Tag
              </label>
              <Input
                type="text"
                placeholder="e.g. NitroNinja"
                maxLength={16}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && nameInput.trim()) onContinue(); }}
                autoFocus
                className="bg-[var(--input-bg)] border-[var(--border)] text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--cyan)] px-2 py-2"
              />
              {nameInput && (
                <span className="text-[0.6rem] text-[var(--muted)]">{16 - nameInput.length} characters remaining</span>
              )}
            </div>

            {/* CTA button */}
            <button
              onClick={onContinue}
              disabled={!nameInput.trim()}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                font-bold text-sm tracking-widest uppercase transition-all duration-200
                bg-[var(--cyan)] text-white dark:text-black
                dark:[box-shadow:0_0_18px_rgba(0,229,255,0.35)]
                hover:brightness-110 hover:-translate-y-0.5
                disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
            >
              Continue <ArrowRight size={16} />
            </button>

            {/* Stats */}
            <div className="flex items-center justify-around pt-4 border-t border-[var(--border)]">
              {[["4","Categories"],["2","Players"],["∞","Rounds"]].map(([num, label], i, arr) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="font-[var(--font-dm-mono)] text-xl font-bold text-[var(--cyan)]"
                      style={{ textShadow: "0 0 8px rgba(0,229,255,0.3)" }}
                    >
                      {num}
                    </span>
                    <span className="text-[0.55rem] tracking-[2px] uppercase text-[var(--muted)]">{label}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-px h-7 bg-[var(--border)]" />}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
