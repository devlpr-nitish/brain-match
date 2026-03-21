"use client";

import type { Dispatch, SetStateAction } from "react";
import { Brain, PlusCircle, LogIn, Hash, Box, Star, Film, Zap, Shield, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";

type SplashScreenProps = {
  playerNameInput: string;
  joinCodeInput: string;
  setPlayerNameInput: Dispatch<SetStateAction<string>>;
  setJoinCodeInput: Dispatch<SetStateAction<string>>;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
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

export function SplashScreen({
  playerNameInput, joinCodeInput, setPlayerNameInput, setJoinCodeInput, onCreateRoom, onJoinRoom,
}: SplashScreenProps) {
  return (
    <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)]">

      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />

      <div className="relative z-10 min-h-screen flex flex-col md:flex-row">

        {/* LEFT: Hero */}
        <div
          className="flex-1 flex flex-col justify-center md:border-r border-[var(--border)]"
          style={{ padding: "4rem 2rem 4rem 4rem" }}
        >
          <div className="flex flex-col gap-7" style={{ maxWidth: "420px" }}>

            <div className="flex items-center gap-4">
              <Brain size={44} className="text-[var(--cyan)] shrink-0" style={{ filter: "drop-shadow(0 0 8px rgba(0,229,255,0.3))" }} />
              <div
                className="font-[var(--font-bebas-neue)] leading-none tracking-widest text-[var(--cyan)]"
                style={{ fontSize: "clamp(3rem,6vw,5rem)", textShadow: "var(--glow-cyan)" }}
              >
                Brain<br />Match
              </div>
            </div>

            <p className="text-[0.65rem] tracking-[5px] uppercase text-[var(--muted)] -mt-2">
              The Multiplayer Hint Duel
            </p>

            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Challenge a friend in real-time. Give clever hints, guess their secret, earn points. One arena. Two minds.
            </p>

            <div className="flex flex-col gap-3">
              {highlights.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm font-medium text-[var(--text)]">
                  <Icon size={15} className="text-[var(--cyan)] shrink-0" />{text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {featureCards.map(({ icon: Icon, label, color }) => (
                <span key={label} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border border-[var(--border)] bg-white/40 dark:bg-white/5 text-[var(--muted)]">
                  <Icon size={12} className={color} />{label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="flex-1 flex flex-col justify-center bg-white dark:bg-[#060606]" style={{ padding: "4rem" }}>
          <div className="flex flex-col gap-5" style={{ maxWidth: "320px", margin: "0 auto" }}>

            <div className="flex items-center gap-3">
              <Brain size={20} className="text-[var(--cyan)]" />
              <h2 className="font-[var(--font-bebas-neue)] text-3xl tracking-[3px] text-[var(--cyan)]">Enter the Arena</h2>
            </div>
            <p className="text-xs text-[var(--muted)] -mt-2">Create a room or join a friend</p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6rem] tracking-[3px] uppercase text-[var(--muted)]">Your Gamer Tag</label>
              <Input
                type="text" placeholder="e.g. NitroNinja" maxLength={16}
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onCreateRoom(); }}
                className="bg-[var(--input-bg)] border-[var(--border)] text-[var(--text)] placeholder:text-[var(--muted)] focus:border-[var(--cyan)] px-2"
              />
            </div>

            <button
              onClick={onCreateRoom}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all
                bg-[var(--cyan)] text-white dark:text-black
                dark:[box-shadow:0_0_16px_rgba(0,229,255,0.4)]
                hover:brightness-110 hover:-translate-y-px"
            >
              <PlusCircle size={16} /> Create Room
            </button>

            <div className="flex items-center gap-4 text-[var(--muted)] text-xs tracking-[3px]">
              <div className="flex-1 h-px bg-[var(--border)]" />OR<div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.6rem] tracking-[3px] uppercase text-[var(--muted)]">Have a Room Code?</label>
              <Input
                type="text" placeholder="ABCD" maxLength={4}
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === "Enter") onJoinRoom(); }}
                className="bg-[var(--input-bg)] border-[var(--border)] text-[var(--pink)] placeholder:text-[var(--muted)] text-center tracking-[6px] uppercase text-xl font-[var(--font-dm-mono)] focus:border-[var(--pink)]"
              />
            </div>

            <button
              onClick={onJoinRoom}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition-all
                bg-transparent border border-[var(--pink)] text-[var(--pink)]
                hover:bg-[var(--pink)]/10 hover:-translate-y-px"
            >
              <LogIn size={16} /> Join Room
            </button>

            <div className="flex items-center justify-around pt-4 border-t border-[var(--border)]">
              {[["4","Categories"],["2","Players"],["∞","Rounds"]].map(([num, label], i, arr) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-[var(--font-dm-mono)] text-xl font-bold text-[var(--cyan)]">{num}</span>
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
