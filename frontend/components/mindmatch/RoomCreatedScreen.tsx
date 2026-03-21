"use client";

import { Copy, Users, CheckCircle, Clock } from "lucide-react";

type RoomCreatedScreenProps = {
  roomCode: string;
  slot1Name: string;
  slot2Name: string;
  slot2Filled: boolean;
  waitingMessage: string;
};

export function RoomCreatedScreen({ roomCode, slot1Name, slot2Name, slot2Filled, waitingMessage }: RoomCreatedScreenProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const joinLink = `${baseUrl}?room=${roomCode}`;
  const copyToClipboard = () => navigator.clipboard.writeText(joinLink).catch(() => alert("Failed to copy link"));

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text)]">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: "linear-gradient(var(--grid-color) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color) 1px,transparent 1px)", backgroundSize: "60px 60px" }}
      />

      <div className="relative z-10 anim-slide-up w-full flex flex-col gap-5" style={{ maxWidth: "460px", padding: "1.5rem" }}>

        <div className="text-center mb-1">
          <div
            className="font-[var(--font-bebas-neue)] tracking-widest text-[var(--cyan)] anim-flicker"
            style={{ fontSize: "clamp(2.5rem,8vw,3.5rem)", textShadow: "var(--glow-cyan)" }}
          >
            Brain Match
          </div>
          <div className="text-xs tracking-[4px] uppercase text-[var(--muted)] mt-1">Room Created</div>
        </div>

        <div
          className="bg-white dark:bg-[#0f0f0f] border border-[var(--border)] rounded-2xl flex flex-col gap-6"
          style={{ padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <Users size={20} className="text-[var(--cyan)]" />
            <h2 className="font-[var(--font-bebas-neue)] text-[1.8rem] tracking-[3px] text-[var(--cyan)]">Share Your Room</h2>
          </div>
          <p className="text-sm text-[var(--muted)] -mt-3">Send this code or link to your opponent</p>

          {/* Code block */}
          <div
            className="rounded-xl border border-[var(--cyan)] bg-[var(--surface)] dark:bg-black/20 flex flex-col items-center gap-4"
            style={{ padding: "1.25rem", boxShadow: "var(--glow-cyan)" }}
          >
            <div className="text-[0.6rem] tracking-[3px] uppercase text-[var(--muted)]">Room Code</div>
            <div
              className="font-[var(--font-dm-mono)] tracking-[8px] text-[var(--cyan)] anim-flicker"
              style={{ fontSize: "clamp(2.5rem,10vw,4rem)", textShadow: "var(--glow-cyan)" }}
            >
              {roomCode}
            </div>
            <div className="w-full rounded-lg border border-[var(--border)] bg-white dark:bg-[#111] text-[0.7rem] text-[var(--muted)] font-[var(--font-dm-mono)] break-all text-center" style={{ padding: "0.5rem 0.75rem" }}>
              {joinLink}
            </div>
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all
                bg-transparent border border-[var(--cyan)] text-[var(--cyan)]
                hover:bg-[var(--cyan)]/10 hover:-translate-y-px"
            >
              <Copy size={15} /> Copy Link
            </button>
          </div>

          {/* Player slots */}
          <div className="flex flex-col gap-3">
            <div className="text-[0.6rem] tracking-[3px] uppercase text-[var(--muted)] text-center">Players Connected</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--green)] bg-[var(--surface)] dark:bg-[#0f0f0f] flex flex-col gap-1" style={{ padding: "1rem", boxShadow: "0 0 14px rgba(0,255,157,0.1)" }}>
                <div className="text-base font-bold text-[var(--green)]">{slot1Name || "—"}</div>
                <div className="flex items-center gap-1 text-[0.6rem] tracking-[2px] uppercase text-[var(--muted)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--green)] anim-pulse inline-block" />
                  <CheckCircle size={10} className="text-[var(--green)]" /> Host
                </div>
              </div>
              <div
                className="rounded-xl border flex flex-col gap-1 bg-[var(--surface)] dark:bg-[#0f0f0f]"
                style={{ padding: "1rem", borderColor: slot2Filled ? "var(--green)" : "var(--border)", borderStyle: slot2Filled ? "solid" : "dashed" }}
              >
                <div className="text-base font-bold" style={{ color: slot2Filled ? "var(--green)" : "var(--muted)" }}>{slot2Name || "—"}</div>
                <div className="flex items-center gap-1 text-[0.6rem] tracking-[2px] uppercase text-[var(--muted)]">
                  {slot2Filled ? <><CheckCircle size={10} className="text-[var(--green)]" /> Connected</> : <><Clock size={10} /> Waiting…</>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--green)] anim-pulse inline-block" />
            {waitingMessage}
          </div>
        </div>
      </div>
    </div>
  );
}
