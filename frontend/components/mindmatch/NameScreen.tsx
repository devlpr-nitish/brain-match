"use client";

import type { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Swords, Hash, Box, Star, Film, ArrowRight, Zap, Shield, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";

type NameScreenProps = {
  nameInput: string;
  setNameInput: Dispatch<SetStateAction<string>>;
  onContinue: () => void;
  isJoining?: boolean;
};

const featureCards = [
  { icon: Hash, label: "Numbers", color: "text-[var(--cyan)]" },
  { icon: Box, label: "Objects", color: "text-[var(--purple)]" },
  { icon: Star, label: "Famous People", color: "text-[var(--yellow)]" },
  { icon: Film, label: "Movies / Shows", color: "text-[var(--pink)]" },
];

const highlights = [
  { icon: Zap, text: "Real-time duels" },
  { icon: Shield, text: "Strategic hints" },
  { icon: Trophy, text: "Outsmart & win" },
];

export function NameScreen({ nameInput, setNameInput, onContinue, isJoining }: NameScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">

      {/* Grid + vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(0,119,204,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(0,229,255,0.12),transparent_55%)]"
        aria-hidden
      />

      {/* Two-column layout */}
      <div className="relative z-10 min-h-screen flex flex-col md:flex-row">

        {/* ── LEFT: Hero ── */}
        <div className="relative flex-1 flex flex-col items-center justify-center py-16 px-8 md:px-12 lg:px-16 md:border-r border-[var(--border)]/80 dark:border-[var(--border)]/60">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute -left-24 top-1/4 h-[min(480px,80vw)] w-[min(480px,80vw)] rounded-full blur-[100px] opacity-60 dark:opacity-100
              bg-[radial-gradient(circle_at_center,rgba(0,119,204,0.18),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.14),transparent_70%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-1/4 translate-y-1/4 rounded-full blur-[90px] opacity-40
              bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(177,107,255,0.1),transparent_70%)]"
            aria-hidden
          />

          <div className="relative flex flex-col gap-8 w-full max-w-[440px]">

            {/* Logo block */}
            <div className="anim-slide-up flex flex-row items-center gap-5">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-[18px] bg-[var(--cyan)]/20 blur-xl dark:bg-[var(--cyan)]/25" aria-hidden />
                <Image
                  src="/logo.png"
                  alt="Brain Match Logo"
                  width={56}
                  height={56}
                  className="relative shrink-0 rounded-[14px] ring-2 ring-[var(--cyan)]/25 ring-offset-2 ring-offset-[var(--bg)] dark:ring-offset-black anim-float"
                />
              </div>
              <div
                className="font-[var(--font-bebas-neue)] leading-[0.92] tracking-[0.08em] text-[var(--cyan)]"
                style={{ fontSize: "clamp(3rem,6vw,5rem)", textShadow: "var(--glow-cyan)" }}
              >
                Brain Match
              </div>
            </div>

            {/* Tagline */}
            <p className="anim-slide-up text-[0.65rem] tracking-[0.35em] uppercase text-[var(--muted)] -mt-2 [animation-delay:60ms]">
              The Multiplayer Hint Duel
            </p>

            {/* Description */}
            <p className="anim-slide-up text-[0.9375rem] text-[var(--muted)] leading-relaxed [animation-delay:120ms]">
              Challenge a friend in real-time. Give clever hints, guess their secret, earn points. One arena. Two minds.
            </p>

            {/* Feature bullets */}
            <div className="anim-slide-up flex flex-col gap-2.5 [animation-delay:180ms]">
              {highlights.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--cyan)]/35"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cyan)]/10 text-[var(--cyan)] transition-transform group-hover:scale-105 dark:bg-[var(--cyan)]/15">
                    <Icon size={16} strokeWidth={2.25} />
                  </span>
                  {text}
                </div>
              ))}
            </div>

            {/* Category pills */}
            <div className="anim-slide-up flex flex-wrap gap-2 [animation-delay:240ms]">
              {featureCards.map(({ icon: Icon, label, color }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-full text-xs font-medium border border-[var(--border)]
                    text-[var(--muted)]
                    transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--cyan)]/35 hover:shadow-md"
                >
                  <Icon size={12} className={color} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form ── */}
        <div className="relative flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-white to-[#f5f0dc] dark:from-[#0a0a0a] dark:to-black px-6 py-14 sm:px-10 md:px-12 lg:px-16">
          <div
            className="pointer-events-none absolute top-1/4 right-0 h-72 w-72 translate-x-1/3 rounded-full blur-[100px] opacity-70
              bg-[radial-gradient(circle_at_center,rgba(0,119,204,0.12),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.08),transparent_70%)]"
            aria-hidden
          />

          <div
            className="relative mx-auto flex w-full max-w-[380px] flex-col gap-8 rounded-[1.75rem] sm:p-8 md:p-9"
          >

            {/* Form heading */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--cyan)]/10 text-[var(--cyan)] ring-1 ring-[var(--cyan)]/25 dark:bg-[var(--cyan)]/12">
                  <Swords size={20} strokeWidth={2.25} />
                </span>
                <div>
                  <h2 className="font-[var(--font-bebas-neue)] text-[2rem] leading-none tracking-[0.12em] text-[var(--cyan)]" style={{ textShadow: "var(--glow-cyan)" }}>
                    {isJoining ? "Join Arena" : "Enter Arena"}
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">Pick a name to get started</p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[0.6rem] font-medium tracking-[0.25em] uppercase text-[var(--muted)]">
                Your Gamer Name
              </label>
              <Input
                type="text"
                placeholder="Jonny Sins"
                maxLength={16}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && nameInput.trim()) onContinue(); }}
                autoFocus
                className="h-auto rounded-2xl border-2 border-[var(--border)] bg-[var(--input-bg)] px-2 py-2 text-base leading-snug text-[var(--text)] shadow-inner transition-[border-color,box-shadow] placeholder:text-[var(--muted)]/80
                  focus-visible:border-[var(--cyan)] focus-visible:ring-[3px] focus-visible:ring-[var(--cyan)]/25 focus-visible:outline-none focus-visible:ring-offset-0"
              />
              {nameInput && (
                <span className="text-[0.65rem] tabular-nums text-[var(--muted)]">
                  {16 - nameInput.length} characters remaining
                </span>
              )}
            </div>

            {/* CTA button */}
            <button
              type="button"
              onClick={onContinue}
              disabled={!nameInput.trim()}
              className="group flex items-center justify-center gap-2.5 w-full rounded-2xl px-2 py-2
                font-bold text-sm tracking-[0.2em] uppercase transition-all duration-200
                bg-[var(--cyan)] text-white shadow-[0_4px_24px_-4px_rgba(0,119,204,0.45)] dark:text-black
                dark:shadow-[0_0_24px_rgba(0,229,255,0.35),0_8px_32px_-8px_rgba(0,229,255,0.25)]
                hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-6px_rgba(0,119,204,0.45)] dark:hover:shadow-[0_0_32px_rgba(0,229,255,0.45)] dark:hover:brightness-105
                disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none disabled:hover:brightness-100"
            >
              Continue
              <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </button>

            {/* Stats */}
            <div className="flex items-center justify-around gap-2 rounded-2xl border border-[var(--border)]/60 bg-[var(--surface)]/50 px-2 py-2 dark:bg-white/[0.03]">
              {[["4", "Categories"], ["2", "Players"], ["∞", "Rounds"]].map(([num, label], i, arr) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="font-[var(--font-dm-mono)] text-xl font-bold text-[var(--cyan)] tabular-nums"
                      style={{ textShadow: "0 0 12px rgba(0,229,255,0.25)" }}
                    >
                      {num}
                    </span>
                    <span className="text-[0.55rem] tracking-[0.15em] uppercase text-[var(--muted)]">{label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="h-8 w-px bg-gradient-to-b from-transparent via-[var(--border)] to-transparent" />
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
