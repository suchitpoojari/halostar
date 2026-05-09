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
  DailyVibeDetailed,
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

  // 1. signature verification
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

  try {
    if (body.product === "daily_vibe_unlock" && body.payload.kind === "daily_vibe") {
      const result = await generateDailyDetailed(body.payload.birth);
      const emailDelivered = await tryEmailPdf({
        to: body.email,
        subject: result.emailSubject,
        textBody: result.emailBody,
        pdfBuffer: result.pdfBuffer,
        pdfFilename: result.pdfFilename,
      });
      return NextResponse.json({
        ok: true,
        product: "daily_vibe_unlock" as const,
        detailed: result.detailed,
        emailDelivered,
      });
    }

    if (body.product === "compatibility_unlock" && body.payload.kind === "compatibility") {
      const result = await generateCompatDetailed(body.payload.boy, body.payload.girl);
      const emailDelivered = await tryEmailPdf({
        to: body.email,
        subject: result.emailSubject,
        textBody: result.emailBody,
        pdfBuffer: result.pdfBuffer,
        pdfFilename: result.pdfFilename,
      });
      return NextResponse.json({
        ok: true,
        product: "compatibility_unlock" as const,
        detailed: result.detailed,
        emailDelivered,
      });
    }

    return NextResponse.json(
      { ok: false, error: "product/payload mismatch" },
      { status: 400 }
    );
  } catch (e) {
    console.error("[razorpay/verify] generation failed", e);
    return NextResponse.json(
      {
        ok: false,
        error:
          "payment ok but generation broke. we'll fix this and email you within a few hours.",
      },
      { status: 500 }
    );
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
    console.error("[razorpay/verify] email send failed", emailErr);
    return false;
  }
}

// ----- daily vibe ₹19 → today's full unlocked horoscope -----

async function generateDailyDetailed(birth: BirthData) {
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

  const detailed = await generateJson<DailyVibeDetailed>(
    DAILY_DETAILED_SYSTEM,
    userPrompt,
    {
      model: MODELS.pdf,
      cacheSystem: true,
      maxTokens: 6000,
      temperature: 0.85,
    }
  );

  const generatedDateLabel = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentDashaLabel = `${currentDasha.planet} mahadasha · ${currentDasha.remaining} remaining`;

  const pdfElement = React.createElement(DailyVibeProPdf, {
    content: detailed,
    birthLabel: `${birth.place} · ${birth.dob} at ${birth.tob}`,
    currentDashaLabel,
    generatedDateLabel,
  });
  const pdfBuffer = await renderToBuffer(
    pdfElement as unknown as Parameters<typeof renderToBuffer>[0]
  );

  return {
    detailed,
    pdfBuffer,
    pdfFilename: `halostar-today-unlocked.pdf`,
    emailSubject: `your halostar unlock — today, in full ✦`,
    emailBody: `your full read for today is attached as a keepsake PDF.\n\nthe whole thing's already on the page — this is just for the archive.\n\n— halostar\nhalostar.in`,
  };
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

  const detailed = await generateJson<CompatibilityDetailed>(
    COMPAT_DETAILED_SYSTEM,
    userPrompt,
    {
      model: MODELS.pdf,
      cacheSystem: true,
      maxTokens: 8000,
      temperature: 0.85,
    }
  );

  const generatedDateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pdfElement = React.createElement(MatchProPdf, {
    content: detailed,
    boyLabel: `${boy.place} · ${boy.dob} at ${boy.tob}`,
    girlLabel: `${girl.place} · ${girl.dob} at ${girl.tob}`,
    ashtakootRaw: ashtakoot.total,
    generatedDateLabel,
  });
  const pdfBuffer = await renderToBuffer(
    pdfElement as unknown as Parameters<typeof renderToBuffer>[0]
  );

  return {
    detailed,
    pdfBuffer,
    pdfFilename: `halostar-compatibility-unlocked.pdf`,
    emailSubject: `your halostar unlock — compatibility, in full ✦`,
    emailBody: `the full read is on the page — this attachment is the keepsake PDF.\n\nashtakoot ${ashtakoot.total}/36, all 8 koots, mangal + nadi, the works.\n\n— halostar\nhalostar.in`,
  };
}
