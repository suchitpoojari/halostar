"use client";

import { useEffect, useRef, useState } from "react";
import { UnlockSheet } from "@/components/UnlockSheet";
import {
  PRICING,
  type CompatibilityDetailed,
  type CompatibilityVibe,
  type MatchRequest,
} from "@/types/vedic";

interface Props {
  match: CompatibilityVibe;
  request: MatchRequest;
  onReset: () => void;
}

export function MatchResult({ match, request, onReset }: Props) {
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detailed, setDetailed] = useState<CompatibilityDetailed | null>(null);
  const detailedRef = useRef<HTMLDivElement | null>(null);

  function copyToShare() {
    const text = `${match.matchPercent}% match on halostar — "${match.verdict}"\n\nrun yours: halostar.in/match`;
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

  const pricing = PRICING.compatibility_unlock;

  return (
    <>
      <article className="flex w-full flex-col gap-14">
        <p className="float-in float-in-1 label-meta">the match</p>

        <h1 className="float-in float-in-2 serif-italic text-[80px] leading-none tracking-[-0.04em] text-paper sm:text-[120px]">
          {match.matchPercent}<span className="text-paper-muted">%</span>
        </h1>

        <p className="float-in float-in-2 serif-italic text-[26px] leading-[1.15] tracking-[-0.015em] text-paper sm:text-[34px]">
          {match.verdict}
        </p>

        <Pillar
          label="vibe sync"
          score={match.pillars.vibeSync.score}
          body={match.pillars.vibeSync.line}
        />
        <Pillar
          label="communication"
          score={match.pillars.communication.score}
          body={match.pillars.communication.line}
        />
        <Pillar
          label="long game"
          score={match.pillars.longGame.score}
          body={match.pillars.longGame.line}
        />

        <section className="float-in float-in-4 flex flex-col gap-4">
          <p className="label-meta">the chart</p>
          <dl className="grid grid-cols-3 gap-y-5">
            <Reference label="person 1 moon" value={match.reference.boyMoonSign} />
            <Reference label="person 2 moon" value={match.reference.girlMoonSign} />
            <Reference label="ashtakoot raw" value={`${match.reference.ashtakootRaw} / 36`} />
          </dl>
        </section>

        <hr className="border-line" />

        {/* unlock pitch — hidden once unlocked */}
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

        {/* unlocked: full detailed read */}
        {detailed && (
          <div ref={detailedRef} className="flex flex-col gap-14">
            <hr className="border-line" />

            <section className="flex flex-col gap-3">
              <p className="label-meta">unlocked · the full read</p>
              <h2 className="serif-italic text-[30px] leading-[1.1] tracking-[-0.015em] text-paper sm:text-[40px]">
                {detailed.title}
              </h2>
              <p className="mt-4 text-[17px] leading-[1.6] text-paper">{detailed.intro}</p>
            </section>

            <section className="flex flex-col gap-6">
              <p className="label-meta">all 8 koots</p>
              {detailed.koots.map((k) => (
                <div key={k.name} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between">
                    <p className="serif-italic text-[20px] capitalize text-paper">{k.name}</p>
                    <p className="text-sm text-paper-muted">
                      {k.score} / {k.outOf}
                    </p>
                  </div>
                  <p className="text-[16px] leading-[1.6] text-paper">{k.read}</p>
                </div>
              ))}
            </section>

            <section className="flex flex-col gap-4">
              <p className="label-meta">mangal check</p>
              <p className="text-[17px] leading-[1.6] text-paper">{detailed.mangal}</p>
            </section>

            <section className="flex flex-col gap-4">
              <p className="label-meta">nadi check</p>
              <p className="text-[17px] leading-[1.6] text-paper">{detailed.nadi}</p>
            </section>

            <section className="flex flex-col gap-4">
              <p className="label-meta">how you fight (and repair)</p>
              <p className="text-[17px] leading-[1.6] text-paper">{detailed.fightDecoder}</p>
            </section>

            <section className="flex flex-col gap-4">
              <p className="label-meta">the long game</p>
              <p className="text-[17px] leading-[1.6] text-paper">{detailed.longGame}</p>
            </section>

            <section className="flex flex-col gap-4">
              <p className="label-meta">practices for the two of you</p>
              <ul className="flex flex-col gap-2">
                {detailed.practices.map((p, i) => (
                  <li
                    key={i}
                    className="border-l border-line-strong pl-4 text-[16px] leading-[1.6] text-paper"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex flex-col gap-4">
              <p className="label-meta">if you&rsquo;re considering marriage</p>
              <p className="text-[17px] leading-[1.6] text-paper">{detailed.marriageWindow}</p>
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
            check another pair
          </button>
        </div>
      </article>

      <UnlockSheet
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        product="compatibility_unlock"
        payload={{ kind: "compatibility", boy: request.boy, girl: request.girl }}
        onUnlocked={(r) => {
          if (r.product === "compatibility_unlock") setDetailed(r.detailed);
        }}
      />
    </>
  );
}

function Pillar({ label, score, body }: { label: string; score: number; body: string }) {
  return (
    <section className="float-in float-in-3 flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="label-meta">{label}</p>
        <p className="serif-italic text-base text-paper-muted">{score} / 10</p>
      </div>
      <p className="text-[17px] leading-[1.55] text-paper">{body}</p>
    </section>
  );
}

function Reference({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="label-meta">{label}</dt>
      <dd className="text-sm text-paper">{value}</dd>
    </div>
  );
}
