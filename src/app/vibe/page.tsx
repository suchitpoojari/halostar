"use client";

import Link from "next/link";
import { useState } from "react";
import { BirthDataForm } from "@/components/BirthDataForm";
import { VibeResult } from "@/components/VibeResult";
import type { DailyVibe, VibeCheckRequest } from "@/types/vedic";

type State =
  | { kind: "form" }
  | { kind: "loading" }
  | { kind: "result"; vibe: DailyVibe; birth: VibeCheckRequest }
  | { kind: "error"; msg: string };

export default function VibePage() {
  const [state, setState] = useState<State>({ kind: "form" });

  async function handleSubmit(payload: VibeCheckRequest) {
    setState({ kind: "loading" });
    try {
      const r = await fetch("/api/vibe-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await r.json()) as { ok: boolean; vibe?: DailyVibe; error?: string };
      if (!r.ok || !j.ok || !j.vibe) {
        setState({ kind: "error", msg: j.error ?? "the cosmos timed out. try again?" });
        return;
      }
      setState({ kind: "result", vibe: j.vibe, birth: payload });
    } catch (e) {
      setState({ kind: "error", msg: (e as Error).message ?? "network glitch. try again?" });
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pt-10 sm:pt-14">
      <header className="float-in float-in-1 flex items-center justify-between">
        <Link href="/" className="text-sm tracking-tight text-paper transition hover:text-paper/70">
          halostar
        </Link>
        <span className="label-meta">horoscope</span>
      </header>

      <section className="flex flex-1 flex-col py-20">
        {state.kind === "form" && <FormState onSubmit={handleSubmit} />}
        {state.kind === "loading" && <LoadingState />}
        {state.kind === "result" && (
          <VibeResult vibe={state.vibe} birth={state.birth} onReset={() => setState({ kind: "form" })} />
        )}
        {state.kind === "error" && (
          <ErrorState msg={state.msg} onRetry={() => setState({ kind: "form" })} />
        )}
      </section>

      <footer className="float-in float-in-5 py-8">
        <span className="label-meta">© halostar</span>
      </footer>
    </main>
  );
}

function FormState({ onSubmit }: { onSubmit: (p: VibeCheckRequest) => Promise<void> }) {
  return (
    <>
      <h1 className="float-in float-in-2 serif-italic text-[34px] leading-[1.05] tracking-[-0.02em] text-paper sm:text-[44px]">
        drop your birth data.
      </h1>
      <p className="float-in float-in-3 mb-14 mt-6 max-w-sm text-base leading-[1.55] text-paper-muted">
        date, time, place. real vedic chart. today&rsquo;s panchang.
      </p>
      <div className="float-in float-in-4">
        <BirthDataForm onSubmit={onSubmit} />
      </div>
    </>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <p className="float-in float-in-1 label-meta">reading the chart</p>
      <h1 className="float-in float-in-2 serif-italic text-[28px] leading-[1.1] text-paper sm:text-[36px]">
        consulting today&rsquo;s panchang...
      </h1>
      <ul className="float-in float-in-3 mt-4 flex flex-col gap-2.5 text-sm leading-relaxed text-paper-muted">
        <li>checking the nakshatra you woke up under</li>
        <li>cross-referencing your moon sign</li>
        <li>clocking your current mahadasha</li>
        <li>translating the cosmos into something readable</li>
      </ul>
      <p className="float-in float-in-4 mt-2 text-[11px] text-paper-faint">~10 seconds.</p>
    </div>
  );
}

function ErrorState({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="flex max-w-sm flex-col gap-6">
      <p className="float-in float-in-1 label-meta text-destructive">something glitched</p>
      <h2 className="float-in float-in-2 serif-italic text-[26px] leading-tight text-paper sm:text-[32px]">
        {msg}
      </h2>
      <button
        onClick={onRetry}
        className="mt-2 self-start text-sm text-paper transition hover:text-paper/70"
      >
        try again →
      </button>
    </div>
  );
}
