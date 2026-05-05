"use client";

import Link from "next/link";
import { useState } from "react";
import { MatchForm } from "@/components/MatchForm";
import { MatchResult } from "@/components/MatchResult";
import type { CompatibilityVibe, MatchRequest } from "@/types/vedic";

type State =
  | { kind: "form" }
  | { kind: "loading" }
  | { kind: "result"; match: CompatibilityVibe; request: MatchRequest }
  | { kind: "error"; msg: string };

export default function MatchPage() {
  const [state, setState] = useState<State>({ kind: "form" });

  async function handleSubmit(payload: MatchRequest) {
    setState({ kind: "loading" });
    try {
      const r = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = (await r.json()) as { ok: boolean; match?: CompatibilityVibe; error?: string };
      if (!r.ok || !j.ok || !j.match) {
        setState({ kind: "error", msg: j.error ?? "the cosmos timed out. try again?" });
        return;
      }
      setState({ kind: "result", match: j.match, request: payload });
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
        <span className="label-meta">compatibility</span>
      </header>

      <section className="flex flex-1 flex-col py-20">
        {state.kind === "form" && (
          <>
            <h1 className="float-in float-in-2 serif-italic text-[34px] leading-[1.05] tracking-[-0.02em] text-paper sm:text-[44px]">
              two birth charts.
              <br />
              one match read.
            </h1>
            <p className="float-in float-in-3 mb-14 mt-6 max-w-sm text-base leading-[1.55] text-paper-muted">
              vedic ashtakoot guna milan + your moon signs, decoded in halostar voice.
            </p>
            <div className="float-in float-in-4">
              <MatchForm onSubmit={handleSubmit} />
            </div>
          </>
        )}

        {state.kind === "loading" && (
          <div className="flex flex-col gap-6">
            <p className="float-in float-in-1 label-meta">running both charts</p>
            <h1 className="float-in float-in-2 serif-italic text-[28px] leading-[1.1] text-paper sm:text-[36px]">
              ashtakoot guna milan in progress...
            </h1>
            <ul className="float-in float-in-3 mt-4 flex flex-col gap-2.5 text-sm leading-relaxed text-paper-muted">
              <li>matching the 8 koots: varna, vasya, tara, yoni, grahamaitri, gana, bhakoot, nadi</li>
              <li>cross-checking moon signs</li>
              <li>translating the cosmos into something readable</li>
            </ul>
            <p className="float-in float-in-4 mt-2 text-[11px] text-paper-faint">~15 seconds.</p>
          </div>
        )}

        {state.kind === "result" && (
          <MatchResult match={state.match} request={state.request} onReset={() => setState({ kind: "form" })} />
        )}

        {state.kind === "error" && (
          <div className="flex max-w-sm flex-col gap-6">
            <p className="float-in float-in-1 label-meta text-destructive">something glitched</p>
            <h2 className="float-in float-in-2 serif-italic text-[26px] leading-tight text-paper sm:text-[32px]">
              {state.msg}
            </h2>
            <button onClick={() => setState({ kind: "form" })} className="mt-2 self-start text-sm text-paper transition hover:text-paper/70">
              try again →
            </button>
          </div>
        )}
      </section>

      <footer className="float-in float-in-5 py-8">
        <span className="label-meta">© halostar</span>
      </footer>
    </main>
  );
}
