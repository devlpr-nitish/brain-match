"use client";

import type { CategoryKey } from "@/app/types";
import { Hash, Box, Star, Film, CheckCircle } from "lucide-react";

type CategoryPickProps = {
  selectedCategory: CategoryKey | "";
  waitingForOpponent: boolean;
  onPick: (category: CategoryKey) => void;
};

const categories: Array<{
  key: CategoryKey;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  description: string;
  activeColor: string;
  activeBorder: string;
  activeGlow: string;
}> = [
  { key: "numbers", icon: Hash,  name: "Numbers",       description: "Pick any number 1–1000", activeColor: "var(--cyan)",   activeBorder: "var(--cyan)",   activeGlow: "rgba(0,229,255,0.08)" },
  { key: "objects", icon: Box,   name: "Object / Word", description: "Any word or object",     activeColor: "var(--purple)", activeBorder: "var(--purple)", activeGlow: "rgba(177,107,255,0.08)" },
  { key: "person",  icon: Star,  name: "Famous Person", description: "Real or fictional",      activeColor: "var(--yellow)", activeBorder: "var(--yellow)", activeGlow: "rgba(255,215,0,0.08)" },
  { key: "movie",   icon: Film,  name: "Movie / Show",  description: "Any film or series",     activeColor: "var(--pink)",   activeBorder: "var(--pink)",   activeGlow: "rgba(255,77,255,0.08)" },
];

export function CategoryPick({ selectedCategory, waitingForOpponent, onPick }: CategoryPickProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />

      <div className="relative z-10 anim-slide-up flex flex-col items-center gap-8 w-full" style={{ maxWidth: "520px", padding: "2rem 1.5rem" }}>

        <div className="text-center">
          <div
            className="font-[var(--font-bebas-neue)] tracking-widest text-[var(--cyan)]"
            style={{ fontSize: "clamp(2.5rem,7vw,4.5rem)", textShadow: "var(--glow-cyan)" }}
          >
            Choose Category
          </div>
          <p className="text-xs tracking-widest uppercase text-[var(--muted)] mt-2">
            Both players pick secretly — opponent won&apos;t see it
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {categories.map(({ key, icon: Icon, name, description, activeColor, activeBorder, activeGlow }) => {
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => onPick(key)}
                className="relative rounded-2xl border text-left transition-all duration-200 hover:-translate-y-1"
                style={{
                  padding: "1.5rem",
                  borderColor: isSelected ? activeBorder : "var(--border)",
                  background: isSelected ? activeGlow : "var(--panel)",
                  boxShadow: isSelected ? `0 0 18px ${activeGlow}` : "none",
                }}
              >
                {isSelected && (
                  <CheckCircle size={14} className="absolute top-3 right-3" style={{ color: activeColor }} />
                )}
                <span className="mb-3 block" style={{ color: isSelected ? activeColor : "var(--muted)" }}>
                  <Icon size={32} />
                </span>
                <div className="font-bold text-sm tracking-widest uppercase" style={{ color: isSelected ? activeColor : "var(--text)" }}>
                  {name}
                </div>
                <div className="text-[0.7rem] text-[var(--muted)] mt-1">{description}</div>
              </button>
            );
          })}
        </div>

        {waitingForOpponent && (
          <div className="flex items-center gap-2 text-sm text-[var(--green)]">
            <span className="w-2 h-2 rounded-full bg-[var(--green)] anim-pulse inline-block" />
            Waiting for opponent to choose…
          </div>
        )}
      </div>
    </div>
  );
}
