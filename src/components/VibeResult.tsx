"use client";

import { useState } from "react";
import { UnlockSheet } from "@/components/UnlockSheet";
import type { DailyVibe, VibeCheckRequest } from "@/types/vedic";

interface Props {
  vibe: DailyVibe;
  birth: VibeCheckRequest;
  onReset: () => void;
}

export function VibeResult({ vibe, birth, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);

  const dateLabel = new Date(vibe.forDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  function copyToShare() {
    const text = `${vibe.oneLiner} — halostar.in`;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <>
      <article className="flex w-full flex-col gap-14">
        <p className="float-in float-in-1 label-meta">{dateLabel}</p>

        <h1 className="float-in float-in-2 serif-italic text-[34px] leading-[1.08] tracking-[-0.02em] text-paper sm:text-[48px]">
          {vibe.oneLiner}
        </h1>

        <Section title="your career">{vibe.career}</Section>
        <Section title="your love">{vibe.love}</Section>
        <Section title="your money">{vibe.money}</Section>

        <Section title="the chart">
          <dl className="mt-4 grid grid-cols-2 gap-y-6 sm:grid-cols-4">
            <Reference label="nakshatra" value={vibe.reference.nakshatra} sub={vibe.reference.nakshatraLord.toLowerCase()} />
            <Reference label="tithi" value={vibe.reference.tithi} />
            <Reference label="moon" value={vibe.reference.moonSign} />
            <Reference label="dasha" value={vibe.reference.currentDasha} />
          </dl>
        </Section>

        <hr className="border-line" />

        {/* unlock */}
        <section className="float-in float-in-5 flex flex-col gap-3">
          <p className="label-meta">go deeper</p>
          <h2 className="serif-italic text-[24px] leading-[1.2] text-paper sm:text-[28px]">
            90-day dasha reading — ₹19
          </h2>
          <p className="text-base leading-[1.55] text-paper-muted">
            the next 90 days, mapped — your current mahadasha, weekly tilts, what to ship, what to wait on. one PDF, lifetime yours.
          </p>
          <button
            type="button"
            onClick={() => setUnlockOpen(true)}
            className="mt-2 self-start text-base text-paper underline-offset-4 hover:underline"
          >
            unlock for ₹19 →
          </button>
        </section>

        <hr className="border-line" />

        <div className="float-in float-in-5 flex items-center gap-8 pt-4">
          <button
            type="button"
            onClick={copyToShare}
            className="text-sm text-paper transition hover:text-paper/70"
          >
            {copied ? "copied →" : "copy & share →"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-paper-muted transition hover:text-paper"
          >
            read another chart
          </button>
        </div>
      </article>

      <UnlockSheet
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        product="daily_vibe_unlock"
        payload={{ kind: "daily_vibe", birth }}
      />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  if (typeof children === "string") {
    return (
      <section className="float-in float-in-3 flex flex-col gap-4">
        <p className="label-meta">{title}</p>
        <p className="text-[17px] leading-[1.55] text-paper">{children}</p>
      </section>
    );
  }
  return (
    <section className="float-in float-in-4 flex flex-col gap-4">
      <p className="label-meta">{title}</p>
      {children}
    </section>
  );
}

function Reference({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="label-meta">{label}</dt>
      <dd className="text-sm text-paper">{value}</dd>
      {sub && <dd className="text-[11px] text-paper-faint">{sub}</dd>}
    </div>
  );
}
