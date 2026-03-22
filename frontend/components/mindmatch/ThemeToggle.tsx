"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="fixed top-4 right-4 z-50 p-2 rounded-xl border border-[var(--border)] bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm opacity-0 pointer-events-none"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="fixed top-4 right-4 z-50 p-2 rounded-xl border border-[var(--border)] bg-white/80 dark:bg-[#111]/80
        backdrop-blur-sm dark:[box-shadow:0_0_12px_rgba(0,229,255,0.15)]
        hover:border-[var(--cyan)] transition-all"
    >
      {theme === "light"
        ? <Moon size={20} className="text-[var(--cyan)]" />
        : <Sun  size={20} className="text-[var(--yellow)]" />}
    </button>
  );
}
