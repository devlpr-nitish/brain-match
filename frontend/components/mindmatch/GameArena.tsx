"use client";

import type { ChatMessage, Names, Role, Scores } from "@/app/types";
import { Brain, Send, Eye, Timer, Swords } from "lucide-react";

type TurnMode = "ask_or_guess" | "provide_hint" | "guess_after_hint";

type GameArenaProps = {
  myRole: Role;
  names: Names;
  scores: Scores;
  round: number;
  mySecret: string;
  myHintsLeft: number;
  chatMessages?: ChatMessage[];
  messageInput?: string;
  setMessageInput?: (value: string) => void;
  hintInput?: string;
  guessInput?: string;
  setHintInput?: (value: string) => void;
  setGuessInput?: (value: string) => void;
  chatLeft?: ChatMessage[];
  chatRight?: ChatMessage[];
  timerSeconds: number;
  activeRole?: Role;
  turnMode?: TurnMode;
  canSendHint: boolean;
  onSendHint: () => void;
  onSendGuess: () => void;
};

function MsgBubble({ msg }: { msg: ChatMessage }) {
  const styleMap: Record<string, React.CSSProperties> = {
    hint:    { alignSelf: "flex-start", border: "1px solid rgba(0,229,255,0.3)",  background: "rgba(0,229,255,0.05)",  color: "var(--cyan)",   borderRadius: "0.75rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", maxWidth: "92%" },
    guess:   { alignSelf: "flex-end",   border: "1px solid rgba(255,77,255,0.3)", background: "rgba(255,77,255,0.05)", color: "var(--pink)",   borderRadius: "0.75rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", maxWidth: "92%" },
    system:  { alignSelf: "center",     border: "1px solid rgba(177,107,255,0.2)",background: "rgba(177,107,255,0.05)",color: "var(--purple)", borderRadius: "0.75rem", padding: "0.5rem 0.75rem", fontSize: "0.75rem",  maxWidth: "92%", textAlign: "center" },
    correct: { alignSelf: "center",     border: "1px solid rgba(0,255,157,0.3)",  background: "rgba(0,255,157,0.06)", color: "var(--green)",  borderRadius: "0.75rem", padding: "0.5rem 0.75rem", fontSize: "0.875rem", maxWidth: "92%", fontWeight: "700", textAlign: "center" },
  };
  const st = styleMap[msg.type] ?? styleMap.system;
  return (
    <div style={st}>
      {msg.label && <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.5, marginBottom: "0.125rem" }}>{msg.label}</div>}
      {msg.text}
    </div>
  );
}

export function GameArena({
  myRole, names, scores, round, mySecret, myHintsLeft,
  chatMessages, messageInput, setMessageInput, hintInput, guessInput,
  setHintInput, setGuessInput, chatLeft, chatRight,
  timerSeconds, activeRole, turnMode, canSendHint, onSendHint, onSendGuess,
}: GameArenaProps) {
  const timerPct = Math.max(0, (timerSeconds / 30) * 100);
  const isUrgent = timerSeconds <= 10;
  const resolvedTurnMode: TurnMode = turnMode ?? "ask_or_guess";
  const resolvedActiveRole: Role = activeRole ?? myRole;
  const myTurn = resolvedActiveRole === myRole;
  const activeName = names[resolvedActiveRole] || resolvedActiveRole;
  const mergedMessages = chatMessages ?? [...(chatLeft ?? []), ...(chatRight ?? [])];
  const resolvedInput = messageInput ?? (resolvedTurnMode === "provide_hint" ? (hintInput ?? "") : (guessInput ?? ""));

  const updateInput = (v: string) => {
    if (setMessageInput) { setMessageInput(v); return; }
    resolvedTurnMode === "provide_hint" ? setHintInput?.(v) : setGuessInput?.(v);
  };

  const hintLabel = resolvedTurnMode === "provide_hint" ? "Give Hint" : "Ask Hint";
  const turnText = resolvedTurnMode === "provide_hint" ? `${activeName} → Give hint`
    : resolvedTurnMode === "guess_after_hint" ? `${activeName} → Guess now`
    : `${activeName} → Ask hint or guess`;
  const canHint = myTurn && (resolvedTurnMode === "ask_or_guess" || (resolvedTurnMode === "provide_hint" && canSendHint));
  const canGuess = myTurn && (resolvedTurnMode === "ask_or_guess" || resolvedTurnMode === "guess_after_hint");

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between flex-wrap gap-2 bg-white dark:bg-[#0a0a0a] border-b border-[var(--border)]"
        style={{ padding: "0.75rem 1.25rem" }}
      >
        <div className="flex items-center gap-2 font-[var(--font-bebas-neue)] text-xl tracking-[3px] text-[var(--cyan)]">
          <Brain size={18} className="text-[var(--cyan)]" /> Brain Match
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-[0.55rem] tracking-[2px] uppercase text-[var(--muted)]">{names.P1 || "P1"}</div>
            <div className="font-[var(--font-dm-mono)] text-xl font-bold text-[var(--cyan)]" style={{ textShadow: "0 0 10px rgba(0,229,255,0.4)" }}>{scores.P1}</div>
          </div>
          <Swords size={14} className="text-[var(--border)]" />
          <div className="text-center">
            <div className="text-[0.55rem] tracking-[2px] uppercase text-[var(--muted)]">{names.P2 || "P2"}</div>
            <div className="font-[var(--font-dm-mono)] text-xl font-bold text-[var(--pink)]" style={{ textShadow: "0 0 10px rgba(255,77,255,0.4)" }}>{scores.P2}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[0.6rem] tracking-[2px] uppercase text-[var(--muted)] font-[var(--font-dm-mono)]"
            style={{ padding: "0.25rem 0.625rem" }}
          >
            Round {round}
          </span>
          <span className="font-[var(--font-dm-mono)] text-lg font-bold flex items-center gap-1" style={{ color: isUrgent ? "var(--pink)" : "var(--cyan)" }}>
            <Timer size={14} />{timerSeconds}s
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-0.5 bg-[var(--border)]">
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: `${timerPct}%`,
            background: isUrgent
              ? "linear-gradient(90deg,var(--pink),var(--orange))"
              : "linear-gradient(90deg,var(--cyan),var(--purple))",
          }}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col mx-auto w-full" style={{ maxWidth: "720px", padding: "1rem 1.25rem 1.5rem" }}>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-[var(--font-bebas-neue)] text-2xl tracking-[3px] text-[var(--cyan)]">
            <Swords size={18} /> Shared Chat
          </div>
          <span
            className="text-[0.6rem] tracking-[2px] uppercase font-bold rounded-lg border"
            style={{
              padding: "0.25rem 0.625rem",
              borderColor: myTurn ? "var(--green)" : "var(--border)",
              color: myTurn ? "var(--green)" : "var(--muted)",
              background: myTurn ? "rgba(0,255,157,0.06)" : "var(--surface)",
            }}
          >
            {turnText}
          </span>
        </div>

        {/* Secret reveal */}
        <div
          className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--muted)] mb-3"
          style={{ padding: "0.5rem 0.75rem" }}
        >
          <Eye size={12} className="inline mr-1 text-[var(--yellow)]" />
          Your secret: <strong className="font-[var(--font-dm-mono)] text-sm text-[var(--yellow)]">{mySecret || "—"}</strong>
          <span className="float-right font-[var(--font-dm-mono)]">{myHintsLeft} hints left</span>
        </div>

        {/* Chat box */}
        <div
          className="flex-1 min-h-48 max-h-72 overflow-y-auto flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] dark:bg-black/20"
          style={{ padding: "1rem" }}
        >
          {mergedMessages.length === 0 && (
            <div className="m-auto text-xs tracking-widest text-[var(--muted)] opacity-60">Game starts here — first move is yours…</div>
          )}
          {mergedMessages.map((m) => <MsgBubble key={m.id} msg={m} />)}
        </div>

        {/* Input row */}
        <div className="flex flex-col gap-1.5 mt-3">
          <div className="text-[0.6rem] tracking-[2px] uppercase text-[var(--muted)] flex items-center gap-1">
            <Send size={10} /> Type once, then choose action
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={myTurn ? "Type your message…" : `Waiting for ${activeName}…`}
              maxLength={100}
              value={resolvedInput}
              onChange={(e) => updateInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (resolvedTurnMode !== "guess_after_hint") onSendHint();
                  if (resolvedTurnMode !== "provide_hint") onSendGuess();
                }
              }}
              disabled={!myTurn}
              className="flex-1 min-w-0 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--cyan)] disabled:opacity-40"
              style={{ padding: "0.625rem 0.75rem" }}
            />
            <button
              onClick={onSendHint}
              disabled={!canHint}
              className="flex items-center gap-1.5 rounded-xl font-bold text-xs tracking-widest uppercase whitespace-nowrap transition-all"
              style={{
                padding: "0.5rem 1rem",
                background: canHint ? "var(--cyan)" : "var(--surface)",
                color: canHint ? "white" : "var(--muted)",
                border: canHint ? "none" : "1px solid var(--border)",
                opacity: canHint ? 1 : 0.3,
                cursor: canHint ? "pointer" : "not-allowed",
              }}
            >
              <Send size={13} /> {hintLabel}
            </button>
            <button
              onClick={onSendGuess}
              disabled={!canGuess}
              className="flex items-center gap-1.5 rounded-xl font-bold text-xs tracking-widest uppercase whitespace-nowrap transition-all"
              style={{
                padding: "0.5rem 1rem",
                borderColor: canGuess ? "var(--pink)" : "var(--border)",
                color: canGuess ? "var(--pink)" : "var(--muted)",
                border: "1px solid",
                background: "transparent",
                opacity: canGuess ? 1 : 0.3,
                cursor: canGuess ? "pointer" : "not-allowed",
              }}
            >
              <Brain size={13} /> Guess
            </button>
          </div>
          <div className="text-[0.65rem] text-[var(--muted)] tracking-wide">
            Turn order alternates: one player sends a hint, opponent sends a guess.
          </div>
        </div>
      </div>
    </div>
  );
}
