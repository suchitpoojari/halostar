"use client";

import { useState } from "react";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "ok" } | { kind: "error"; msg: string };

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "loading") return;
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setState({ kind: "error", msg: data.error ?? "something broke. try again?" });
        return;
      }
      setState({ kind: "ok" });
      setEmail("");
    } catch {
      setState({ kind: "error", msg: "network's being weird. try again?" });
    }
  }

  if (state.kind === "ok") {
    return (
      <div className="float-in float-in-1 mt-8 max-w-md text-center sm:text-left">
        <p className="font-display text-2xl italic text-gold">you&rsquo;re on the list ✨</p>
        <p className="mt-2 text-cream-muted">we&rsquo;ll DM your inbox when halostar drops.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <label className="sr-only" htmlFor="email">email</label>
      <input
        id="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        placeholder="your@email.in"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state.kind === "loading"}
        className="
          flex-1 rounded-full border border-cream/15 bg-cream/5 px-5 py-3.5
          text-cream placeholder:text-cream/40
          backdrop-blur
          outline-none transition
          focus:border-magenta/60 focus:ring-2 focus:ring-magenta/30
          disabled:opacity-60
        "
      />
      <button
        type="submit"
        disabled={state.kind === "loading"}
        className="
          shimmer-cta relative rounded-full px-6 py-3.5
          font-semibold tracking-tight text-cream
          transition active:scale-[0.98]
          disabled:cursor-wait disabled:opacity-80
        "
      >
        <span className="relative z-10">
          {state.kind === "loading" ? "manifesting…" : "get first access"}
        </span>
      </button>
      {state.kind === "error" && (
        <p
          role="alert"
          className="basis-full text-sm text-magenta sm:mt-1"
        >
          {state.msg}
        </p>
      )}
    </form>
  );
}
