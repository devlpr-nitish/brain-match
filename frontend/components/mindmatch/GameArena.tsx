"use client";

import type { ChatMessage, Names, Role, TurnMode, WrongGuesses } from "@/app/types";
import { Brain, Send, Eye, Swords, XCircle, Lightbulb } from "lucide-react";

type GameArenaProps = {
  myRole: Role;
  names: Names;
  wrongGuesses: WrongGuesses;
  round: number;
  mySecret: string;
  hintCounts: Record<Role, number>;
  chatMessages: ChatMessage[];
  messageInput: string;
  setMessageInput: (value: string) => void;
  activeRole: Role;
  turnMode: TurnMode;
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
  myRole, names, wrongGuesses, round, mySecret, hintCounts,
  chatMessages, messageInput, setMessageInput,
  activeRole, turnMode, onSendHint, onSendGuess,
}: GameArenaProps) {
  const isMyTurn = activeRole === myRole;
  const isGivingHint = turnMode === "give_hint" && isMyTurn;
  const isTakingTurn = turnMode === "take_turn" && isMyTurn;
  const activeName = names[activeRole] || activeRole;

  // Turn status text
  const turnText = (() => {
    if (turnMode === "give_hint") {
      return isMyTurn
        ? "Your turn → Give a hint"
        : `${activeName} → Giving a hint…`;
    }
    // take_turn
    return isMyTurn
      ? "Your turn → Ask for hint or guess"
      : `${activeName} → Thinking…`;
  })();

  // Button states
  const canAskHint  = isTakingTurn;
  const canGiveHint = isGivingHint;
  const canGuess    = isTakingTurn;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    if (isGivingHint) { onSendHint(); return; }
    if (isTakingTurn) { onSendGuess(); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)] text-[var(--text)]">

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between flex-wrap gap-2 px-3 py-2 sm:px-5 sm:py-3 bg-white dark:bg-[#0a0a0a] border-b border-[var(--border)]">
        <div className="flex items-center gap-2 font-[var(--font-bebas-neue)] text-xl tracking-[3px] text-[var(--cyan)]">
          <Brain size={18} className="text-[var(--cyan)]" /> Brain Match
        </div>

        {/* Scores / wrong guesses */}
        <div className="flex items-center gap-4">
          {(["P1", "P2"] as Role[]).map((role, i) => (
            <div key={role} className="flex items-center gap-2">
              {i > 0 && <Swords size={14} className="text-[var(--border)]" />}
              <div className="text-center">
                <div className="text-[0.55rem] tracking-[2px] uppercase text-[var(--muted)]">{names[role] || role}</div>
                <div className="flex items-center gap-0.5 font-[var(--font-dm-mono)] text-base font-bold" style={{ color: role === "P1" ? "var(--cyan)" : "var(--pink)" }}>
                  <XCircle size={12} />
                  <span>{wrongGuesses[role]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[0.6rem] tracking-[2px] uppercase text-[var(--muted)] font-[var(--font-dm-mono)]"
            style={{ padding: "0.25rem 0.625rem" }}
          >
            Round {round}
          </span>
          {/* Hint counts */}
          <span className="font-[var(--font-dm-mono)] text-xs text-[var(--muted)]">
            <Lightbulb size={11} className="inline mr-0.5 text-[var(--yellow)]" />
            {hintCounts.P1 + hintCounts.P2} hints
          </span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col justify-center mx-auto w-full max-w-[720px] px-3 sm:px-5 py-4">

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-[var(--font-bebas-neue)] text-2xl tracking-[3px] text-[var(--cyan)]">
            <Swords size={18} /> Shared Chat
          </div>
          <span
            className="text-[0.6rem] tracking-[2px] uppercase font-bold rounded-lg border"
            style={{
              padding: "0.25rem 0.625rem",
              borderColor: isMyTurn ? "var(--green)" : "var(--border)",
              color: isMyTurn ? "var(--green)" : "var(--muted)",
              background: isMyTurn ? "rgba(0,255,157,0.06)" : "var(--surface)",
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
        </div>

        {/* Chat box */}
        <div className="flex-1 min-h-[12rem] max-h-[50vh] overflow-y-auto flex flex-col gap-2 p-3 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] dark:bg-black/20">
          {chatMessages.length === 0 && (
            <div className="m-auto text-xs tracking-widest text-[var(--muted)] opacity-60">Game starts — P1 goes first…</div>
          )}
          {chatMessages.map((m) => <MsgBubble key={m.id} msg={m} />)}
        </div>

        {/* Input */}
        <div className="flex flex-col gap-1.5 mt-3">
          <div className="text-[0.6rem] tracking-[2px] uppercase text-[var(--muted)] flex items-center gap-1">
            <Send size={10} />
            {isGivingHint ? "Type your hint and send" : isTakingTurn ? "Ask for a hint, or make your guess" : `Waiting for ${activeName}…`}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={
                isGivingHint ? "Type your hint…"
                : isTakingTurn ? "Ask hint or enter guess…"
                : `Waiting for ${activeName}…`
              }
              maxLength={120}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!isMyTurn}
              className="flex-1 min-w-0 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--cyan)] disabled:opacity-40"
              style={{ padding: "0.625rem 0.75rem" }}
            />

            {/* Ask Hint button — only during take_turn */}
            {(isTakingTurn) && (
              <button
                onClick={onSendHint}
                disabled={!canAskHint}
                className="flex items-center gap-1.5 rounded-xl font-bold text-xs tracking-widest uppercase whitespace-nowrap transition-all"
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--cyan)",
                  color: "white",
                  opacity: canAskHint ? 1 : 0.3,
                  cursor: canAskHint ? "pointer" : "not-allowed",
                }}
              >
                <Lightbulb size={13} /> Ask Hint
              </button>
            )}

            {/* Give Hint button — only during give_hint */}
            {isGivingHint && (
              <button
                onClick={onSendHint}
                disabled={!canGiveHint}
                className="flex items-center gap-1.5 rounded-xl font-bold text-xs tracking-widest uppercase whitespace-nowrap transition-all"
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--purple)",
                  color: "white",
                  opacity: canGiveHint ? 1 : 0.3,
                  cursor: canGiveHint ? "pointer" : "not-allowed",
                }}
              >
                <Send size={13} /> Give Hint
              </button>
            )}

            {/* Guess button */}
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
        </div>
      </div>
    </div>
  );
}
