"use client";

import { useEffect, useRef, useState } from "react";
import { UnlockSheet } from "@/components/UnlockSheet";
import {
  PRICING,
  type DailyVibe,
  type DailyVibeDetailed,
  type VibeCheckRequest,
} from "@/types/vedic";

interface Props {
  vibe: DailyVibe;
  birth: VibeCheckRequest;
  onReset: () => void;
}

const SEGMENT_ORDER: Array<{
  key: keyof DailyVibe["overview"];
  label: string;
}> = [
  { key: "love", label: "your love" },
  { key: "relationships", label: "your relationships" },
  { key: "work", label: "your work / studies" },
  { key: "finance", label: "your money" },
  { key: "health", label: "your body" },
  { key: "mindset", label: "your mindset" },
];

export function VibeResult({ vibe, birth, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [detailed, setDetailed] = useState<DailyVibeDetailed | null>(null);
  const detailedRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (detailed && detailedRef.current) {
      detailedRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [detailed]);

  const pricing = PRICING.daily_vibe_unlock;

  return (
    <>
      <article className="flex w-full flex-col gap-14">
        <p className="float-in float-in-1 label-meta">{dateLabel}</p>

        <h1 className="float-in float-in-2 serif-italic text-[34px] leading-[1.08] tracking-[-0.02em] text-paper sm:text-[48px]">
          {vibe.oneLiner}
        </h1>

        {/* free overview — all 6 segments */}
        {SEGMENT_ORDER.map(({ key, label }) => (
          <Section key={key} title={label}>
            {vibe.overview[key]}
          </Section>
        ))}

        <Section title="the chart">
          <dl className="mt-4 grid grid-cols-2 gap-y-6 sm:grid-cols-4">
            <Reference
              label="nakshatra"
              value={vibe.reference.nakshatra}
              sub={vibe.reference.nakshatraLord.toLowerCase()}
            />
            <Reference label="tithi" value={vibe.reference.tithi} />
            <Reference label="moon" value={vibe.reference.moonSign} />
            <Reference label="dasha" value={vibe.reference.currentDasha} />
          </dl>
        </Section>

        <hr className="border-line" />

        {/* unlock pitch — only if not already unlocked */}
        {!detailed && (
          <section className="float-in float-in-5 flex flex-col gap-3">
            <p className="label-meta">go deeper</p>
            <h2 className="serif-italic text-[24px] leading-[1.2] text-paper sm:text-[28px]">
              {pricing.label} — ₹{pricing.amountInPaise / 100}
            </h2>
            <p className="text-base leading-[1.55] text-paper-muted">{pricing.blurb}</p>
            <button
              type="button"
              onClick={() => setUnlockOpen(true)}
              className="mt-2 self-start text-base text-paper underline-offset-4 hover:underline"
            >
              {pricing.cta} →
            </button>
          </section>
        )}

        {/* unlocked: detailed read revealed inline */}
        {detailed && (
          <div ref={detailedRef} className="flex flex-col gap-14">
            <hr className="border-line" />

            <section className="flex flex-col gap-3">
              <p className="label-meta">unlocked · today in full</p>
              <h2 className="serif-italic text-[30px] leading-[1.1] tracking-[-0.015em] text-paper sm:text-[40px]">
                {detailed.title}
              </h2>
              <p className="mt-4 text-[17px] leading-[1.6] text-paper">{detailed.intro}</p>
            </section>

            {SEGMENT_ORDER.map(({ key, label }) => {
              const s = detailed.sections[key];
              return (
                <section key={`d-${key}`} className="flex flex-col gap-4">
                  <p className="label-meta">{label} · in detail</p>
                  <p className="text-[17px] leading-[1.6] text-paper">{s.detail}</p>
                  {s.moves.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-2">
                      {s.moves.map((m, i) => (
                        <li
                          key={i}
                          className="border-l border-line-strong pl-4 text-[15px] leading-[1.55] text-paper-muted"
                        >
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}

            <section className="flex flex-col gap-4">
              <p className="label-meta">lucky window</p>
              <p className="text-[17px] leading-[1.6] text-paper">{detailed.luckyWindow}</p>
            </section>

            <section className="flex flex-col gap-4">
              <p className="label-meta">avoid window</p>
              <p className="text-[17px] leading-[1.6] text-paper">{detailed.avoidWindow}</p>
            </section>

            <section className="flex flex-col gap-3">
              <p className="label-meta">today&rsquo;s mantra</p>
              <p className="serif-italic text-[26px] leading-[1.2] text-paper sm:text-[32px]">
                {detailed.mantra}
              </p>
            </section>

            <section className="flex flex-col gap-4">
              <p className="label-meta">closing note</p>
              <p className="text-[17px] leading-[1.6] text-paper">{detailed.closingNote}</p>
            </section>
          </div>
        )}

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
        onUnlocked={(r) => {
          if (r.product === "daily_vibe_unlock") setDetailed(r.detailed);
        }}
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
