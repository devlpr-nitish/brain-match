import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lightbulb, MessageSquare, Swords, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "How to play",
  description:
    "Brain Match rules: two players, secret words, hints and guesses in real time until someone solves the opponent's secret.",
  alternates: { canonical: "/rules" },
};

const sections = [
  {
    icon: Users,
    title: "Two players",
    body: "One host creates a room and shares the code; the other joins. Pick display names and wait in the lobby until both are ready.",
  },
  {
    icon: Swords,
    title: "Secrets & category",
    body: "Choose a category (numbers, objects, famous people, or movies/shows). Each player privately enters a secret the other must guess. Secrets stay hidden until the game ends or they are revealed by play.",
  },
  {
    icon: MessageSquare,
    title: "Turns in the arena",
    body: "Play moves in the shared chat. On your turn you can ask for a hint or type a guess. If you ask for a hint, your opponent must reply with a clue. Then it is your turn again to interpret and guess.",
  },
  {
    icon: Lightbulb,
    title: "Hints, guesses & winning",
    body: "Hints should nudge without giving the answer away. Wrong guesses are counted for each player. The first player to guess the opponent's secret correctly wins the round; you can play again from the win screen.",
  },
];

export default function RulesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] pb-24">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 35%, black 25%, transparent 72%)",
        }}
        aria-hidden
      />
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(0,119,204,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(0,229,255,0.12),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[560px] px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.2em] uppercase text-[var(--muted)] transition-colors hover:text-[var(--cyan)]"
        >
          <ArrowLeft size={16} className="shrink-0" aria-hidden />
          Back to game
        </Link>

        <h1
          className="font-[var(--font-bebas-neue)] tracking-[0.12em] text-[var(--cyan)]"
          style={{ fontSize: "clamp(2.5rem,8vw,3.75rem)", textShadow: "var(--glow-cyan)" }}
        >
          Game rules
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
          {
            "Brain Match is a real-time duel: give clever hints, guess the other player's secret, and win before they crack your secret."
          }
        </p>

        <ul className="mt-10 flex flex-col gap-8">
          {sections.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cyan)]/10 text-[var(--cyan)] ring-1 ring-[var(--cyan)]/20 dark:bg-[var(--cyan)]/12">
                <Icon size={18} strokeWidth={2.25} aria-hidden />
              </span>
              <div>
                <h2 className="font-[var(--font-bebas-neue)] text-xl tracking-[0.08em] text-[var(--text)]">{title}</h2>
                <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
