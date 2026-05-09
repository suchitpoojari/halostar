import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { generateJson, MODELS } from "@/lib/claude";
import { sendPdfEmail } from "@/lib/email";
import { verifyPaymentSignature } from "@/lib/razorpay";
import {
  computeCurrentDasha,
  getAshtakoot,
  getMahaDasha,
  getMangalDosha,
  getMoonSign,
  getPanchang,
  getPlanets,
} from "@/lib/vedic";
import {
  DAILY_DETAILED_SYSTEM,
  buildDailyDetailedUserPrompt,
} from "@/lib/prompts/daily-detailed";
import {
  COMPAT_DETAILED_SYSTEM,
  buildCompatDetailedUserPrompt,
} from "@/lib/prompts/compatibility-detailed";
import { DailyVibeProPdf } from "@/components/pdfs/DailyVibeProPdf";
import { MatchProPdf } from "@/components/pdfs/MatchProPdf";
import type {
  BirthData,
  CompatibilityDetailed,
  CompatibilityKootDetail,
  DailyVibeDetailed,
  DailyVibeDetailedSection,
  RazorpayVerifyRequest,
} from "@/types/vedic";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: RazorpayVerifyRequest;
  try {
    body = (await req.json()) as RazorpayVerifyRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }

  // 1. signature verification — never skip
  const sigOk = verifyPaymentSignature({
    razorpay_order_id: body.razorpay_order_id,
    razorpay_payment_id: body.razorpay_payment_id,
    razorpay_signature: body.razorpay_signature,
  });
  if (!sigOk) {
    console.error("[razorpay/verify] signature mismatch", body.razorpay_order_id);
    return NextResponse.json(
      { ok: false, error: "payment verification failed" },
      { status: 400 }
    );
  }

  console.log("[razorpay/verify] signature ok", {
    payment_id: body.razorpay_payment_id,
    product: body.product,
  });

  try {
    if (body.product === "daily_vibe_unlock" && body.payload.kind === "daily_vibe") {
      const detailed = await generateDailyDetailed(body.payload.birth);

      // PDF + email are bonuses — never let them block the unlock
      const emailDelivered = await tryGenerateAndEmailDailyPdf({
        detailed,
        birth: body.payload.birth,
        to: body.email,
      });

      return NextResponse.json({
        ok: true,
        product: "daily_vibe_unlock" as const,
        detailed,
        emailDelivered,
      });
    }

    if (body.product === "compatibility_unlock" && body.payload.kind === "compatibility") {
      const { detailed, ashtakootRaw } = await generateCompatDetailed(
        body.payload.boy,
        body.payload.girl
      );

      const emailDelivered = await tryGenerateAndEmailCompatPdf({
        detailed,
        boy: body.payload.boy,
        girl: body.payload.girl,
        ashtakootRaw,
        to: body.email,
      });

      return NextResponse.json({
        ok: true,
        product: "compatibility_unlock" as const,
        detailed,
        emailDelivered,
      });
    }

    return NextResponse.json(
      { ok: false, error: "product/payload mismatch" },
      { status: 400 }
    );
  } catch (e) {
    const errMsg = (e as Error)?.message ?? String(e);
    const errStack = (e as Error)?.stack ?? "";
    console.error(
      "[razorpay/verify] generation failed",
      JSON.stringify({
        payment_id: body.razorpay_payment_id,
        product: body.product,
        error: errMsg,
        stack: errStack.slice(0, 800),
      })
    );
    return NextResponse.json(
      {
        ok: false,
        error: `generation failed: ${errMsg.slice(0, 200)}`,
        // payment_id surfaced so the user can hit /api/razorpay/recover with it after we fix
        payment_id: body.razorpay_payment_id,
      },
      { status: 500 }
    );
  }
}

// ----- daily vibe ₹19 → today's full unlocked horoscope -----

async function generateDailyDetailed(birth: BirthData): Promise<DailyVibeDetailed> {
  const today = new Date();
  const [panchang, moonSign, mahaDasha, planets] = await Promise.all([
    getPanchang(today, birth.lat, birth.lon, birth.tz),
    getMoonSign(birth),
    getMahaDasha(birth),
    getPlanets(birth),
  ]);
  const currentDasha = computeCurrentDasha(mahaDasha, today);

  const userPrompt = buildDailyDetailedUserPrompt({
    birthLabel: `${birth.place} · ${birth.dob}, ${birth.tob}`,
    panchang,
    moonSign,
    currentDasha,
    planets,
    forDate: today,
  });

  const raw = await generateJson<Partial<DailyVibeDetailed>>(
    DAILY_DETAILED_SYSTEM,
    userPrompt,
    {
      // sonnet is faster + cheaper + plenty good at structured JSON
      model: MODELS.voice,
      cacheSystem: true,
      maxTokens: 4000,
      temperature: 0.85,
    }
  );

  return sanitizeDailyDetailed(raw);
}

function sanitizeDailyDetailed(raw: Partial<DailyVibeDetailed>): DailyVibeDetailed {
  const safeSection = (s: Partial<DailyVibeDetailedSection> | undefined): DailyVibeDetailedSection => ({
    detail: typeof s?.detail === "string" ? s.detail : "the read came through partial — try the page again, it'll regenerate fresh.",
    moves: Array.isArray(s?.moves) ? s.moves.filter((m): m is string => typeof m === "string") : [],
  });

  const sections = raw.sections ?? ({} as Partial<DailyVibeDetailed["sections"]>);

  return {
    title: typeof raw.title === "string" ? raw.title : "today, unlocked",
    intro: typeof raw.intro === "string" ? raw.intro : "",
    sections: {
      love: safeSection(sections.love),
      relationships: safeSection(sections.relationships),
      work: safeSection(sections.work),
      finance: safeSection(sections.finance),
      health: safeSection(sections.health),
      mindset: safeSection(sections.mindset),
    },
    luckyWindow: typeof raw.luckyWindow === "string" ? raw.luckyWindow : "",
    avoidWindow: typeof raw.avoidWindow === "string" ? raw.avoidWindow : "",
    mantra: typeof raw.mantra === "string" ? raw.mantra : "",
    closingNote: typeof raw.closingNote === "string" ? raw.closingNote : "",
  };
}

async function tryGenerateAndEmailDailyPdf(args: {
  detailed: DailyVibeDetailed;
  birth: BirthData;
  to: string;
}): Promise<boolean> {
  try {
    const today = new Date();
    const mahaDasha = await getMahaDasha(args.birth);
    const currentDasha = computeCurrentDasha(mahaDasha, today);
    const generatedDateLabel = today.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const currentDashaLabel = `${currentDasha.planet} mahadasha · ${currentDasha.remaining} remaining`;

    const pdfElement = React.createElement(DailyVibeProPdf, {
      content: args.detailed,
      birthLabel: `${args.birth.place} · ${args.birth.dob} at ${args.birth.tob}`,
      currentDashaLabel,
      generatedDateLabel,
    });
    const pdfBuffer = await renderToBuffer(
      pdfElement as unknown as Parameters<typeof renderToBuffer>[0]
    );

    return await tryEmailPdf({
      to: args.to,
      subject: `your halostar unlock — today, in full ✦`,
      textBody: `your full read for today is attached as a keepsake PDF.\n\nthe whole thing's already on the page — this is just for the archive.\n\n— halostar\nhalostar.in`,
      pdfBuffer,
      pdfFilename: `halostar-today-unlocked.pdf`,
    });
  } catch (e) {
    // PDF/email is bonus content — never let it break the unlock.
    console.error("[razorpay/verify] daily PDF/email failed (non-fatal)", (e as Error).message);
    return false;
  }
}

// ----- compatibility ₹99 → fully detailed -----

async function generateCompatDetailed(boy: BirthData, girl: BirthData) {
  const [ashtakoot, boyMoonSign, girlMoonSign, boyMangal, girlMangal] = await Promise.all(
    [
      getAshtakoot(boy, girl),
      getMoonSign(boy),
      getMoonSign(girl),
      getMangalDosha(boy),
      getMangalDosha(girl),
    ]
  );

  const userPrompt = buildCompatDetailedUserPrompt({
    ashtakoot,
    boyMoonSign,
    girlMoonSign,
    boyMangal,
    girlMangal,
    boyLabel: `${boy.place} · ${boy.dob}, ${boy.tob}`,
    girlLabel: `${girl.place} · ${girl.dob}, ${girl.tob}`,
  });

  const raw = await generateJson<Partial<CompatibilityDetailed>>(
    COMPAT_DETAILED_SYSTEM,
    userPrompt,
    {
      model: MODELS.voice,
      cacheSystem: true,
      maxTokens: 5000,
      temperature: 0.85,
    }
  );

  return { detailed: sanitizeCompatDetailed(raw), ashtakootRaw: ashtakoot.total };
}

function sanitizeCompatDetailed(raw: Partial<CompatibilityDetailed>): CompatibilityDetailed {
  const KOOT_ORDER = [
    "varna",
    "vasya",
    "tara",
    "yoni",
    "grahamaitri",
    "gana",
    "bhakoot",
    "nadi",
  ] as const;

  const koots = (raw.koots ?? []) as Partial<CompatibilityKootDetail>[];
  const orderedKoots: CompatibilityKootDetail[] = KOOT_ORDER.map((name) => {
    const k = koots.find((x) => x?.name === name);
    return {
      name,
      score: typeof k?.score === "number" ? k.score : 0,
      outOf:
        typeof k?.outOf === "number"
          ? k.outOf
          : { varna: 1, vasya: 2, tara: 3, yoni: 4, grahamaitri: 5, gana: 6, bhakoot: 7, nadi: 8 }[name],
      read: typeof k?.read === "string" ? k.read : "the read for this koot came through partial — try the page again.",
    };
  });

  return {
    title: typeof raw.title === "string" ? raw.title : "the full compatibility read",
    intro: typeof raw.intro === "string" ? raw.intro : "",
    koots: orderedKoots,
    mangal: typeof raw.mangal === "string" ? raw.mangal : "",
    nadi: typeof raw.nadi === "string" ? raw.nadi : "",
    fightDecoder: typeof raw.fightDecoder === "string" ? raw.fightDecoder : "",
    longGame: typeof raw.longGame === "string" ? raw.longGame : "",
    practices: Array.isArray(raw.practices)
      ? raw.practices.filter((p): p is string => typeof p === "string")
      : [],
    marriageWindow: typeof raw.marriageWindow === "string" ? raw.marriageWindow : "",
    closingNote: typeof raw.closingNote === "string" ? raw.closingNote : "",
  };
}

async function tryGenerateAndEmailCompatPdf(args: {
  detailed: CompatibilityDetailed;
  boy: BirthData;
  girl: BirthData;
  ashtakootRaw: number;
  to: string;
}): Promise<boolean> {
  try {
    const generatedDateLabel = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const pdfElement = React.createElement(MatchProPdf, {
      content: args.detailed,
      boyLabel: `${args.boy.place} · ${args.boy.dob} at ${args.boy.tob}`,
      girlLabel: `${args.girl.place} · ${args.girl.dob} at ${args.girl.tob}`,
      ashtakootRaw: args.ashtakootRaw,
      generatedDateLabel,
    });
    const pdfBuffer = await renderToBuffer(
      pdfElement as unknown as Parameters<typeof renderToBuffer>[0]
    );
    return await tryEmailPdf({
      to: args.to,
      subject: `your halostar unlock — compatibility, in full ✦`,
      textBody: `the full read is on the page — this attachment is the keepsake PDF.\n\nashtakoot ${args.ashtakootRaw}/36, all 8 koots, mangal + nadi, the works.\n\n— halostar\nhalostar.in`,
      pdfBuffer,
      pdfFilename: `halostar-compatibility-unlocked.pdf`,
    });
  } catch (e) {
    console.error("[razorpay/verify] compat PDF/email failed (non-fatal)", (e as Error).message);
    return false;
  }
}

async function tryEmailPdf(args: {
  to: string;
  subject: string;
  textBody: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "[razorpay/verify] RESEND_API_KEY not set — skipping bonus email; user gets the read inline"
    );
    return false;
  }
  try {
    await sendPdfEmail(args);
    return true;
  } catch (emailErr) {
    console.error("[razorpay/verify] email send failed", (emailErr as Error).message);
    return false;
  }
}
