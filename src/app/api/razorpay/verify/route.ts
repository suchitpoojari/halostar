import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { generateJson } from "@/lib/claude";
import { sendPdfEmail } from "@/lib/email";
import { verifyPaymentSignature } from "@/lib/razorpay";
import {
  computeCurrentDasha,
  getAshtakoot,
  getMahaDasha,
  getMangalDosha,
  getMoonSign,
  getPlanets,
} from "@/lib/vedic";
import { DASHA_PDF_SYSTEM, buildDashaPdfUserPrompt, type DashaPdfContent } from "@/lib/prompts/dasha-pdf";
import { MATCH_PDF_SYSTEM, buildMatchPdfUserPrompt, type MatchPdfContent } from "@/lib/prompts/match-pdf";
import { DailyVibeProPdf } from "@/components/pdfs/DailyVibeProPdf";
import { MatchProPdf } from "@/components/pdfs/MatchProPdf";
import { MODELS } from "@/lib/claude";
import type { BirthData, RazorpayVerifyRequest } from "@/types/vedic";

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
    return NextResponse.json({ ok: false, error: "payment verification failed" }, { status: 400 });
  }

  try {
    let pdfBuffer: Buffer;
    let pdfFilename: string;
    let emailSubject: string;
    let emailBody: string;

    if (body.product === "daily_vibe_unlock" && body.payload.kind === "daily_vibe") {
      ({ pdfBuffer, pdfFilename, emailSubject, emailBody } = await generateDailyVibePdf(body.payload.birth));
    } else if (body.product === "compatibility_unlock" && body.payload.kind === "compatibility") {
      ({ pdfBuffer, pdfFilename, emailSubject, emailBody } = await generateMatchPdf(body.payload.boy, body.payload.girl));
    } else {
      return NextResponse.json({ ok: false, error: "product/payload mismatch" }, { status: 400 });
    }

    // 3. attempt email delivery — degrade gracefully if Resend is not configured
    let emailDelivered = false;
    try {
      if (process.env.RESEND_API_KEY) {
        await sendPdfEmail({
          to: body.email,
          subject: emailSubject,
          textBody: emailBody,
          pdfBuffer,
          pdfFilename,
        });
        emailDelivered = true;
      } else {
        console.warn("[razorpay/verify] RESEND_API_KEY not set — skipping email; user will download in-browser");
      }
    } catch (emailErr) {
      console.error("[razorpay/verify] email send failed", emailErr);
    }

    // always return PDF as base64 so the client can trigger an in-browser download as fallback
    return NextResponse.json({
      ok: true,
      emailDelivered,
      pdfBase64: pdfBuffer.toString("base64"),
      pdfFilename,
    });
  } catch (e) {
    console.error("[razorpay/verify] generation failed", e);
    return NextResponse.json(
      { ok: false, error: "payment ok but generation broke. we'll fix this and email you within a few hours." },
      { status: 500 }
    );
  }
}

// ----- daily vibe ₹19 → 90-day reading -----

async function generateDailyVibePdf(birth: BirthData) {
  const [moonSign, mahaDasha, planets] = await Promise.all([
    getMoonSign(birth),
    getMahaDasha(birth),
    getPlanets(birth),
  ]);
  const currentDasha = computeCurrentDasha(mahaDasha, new Date());

  const userPrompt = buildDashaPdfUserPrompt({
    birthLabel: `${birth.place} · ${birth.dob}, ${birth.tob}`,
    moonSign,
    mahaDasha,
    currentDasha,
    planets,
    fromDate: new Date(),
  });

  const content = await generateJson<DashaPdfContent>(DASHA_PDF_SYSTEM, userPrompt, {
    model: MODELS.pdf,
    cacheSystem: true,
    maxTokens: 6000,
    temperature: 0.85,
  });

  const generatedDateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const currentDashaLabel = `${currentDasha.planet} mahadasha · ${currentDasha.remaining} remaining`;

  const pdfElement = React.createElement(DailyVibeProPdf, {
    content,
    birthLabel: `${birth.place} · ${birth.dob} at ${birth.tob}`,
    currentDashaLabel,
    generatedDateLabel,
  });
  // react-pdf's renderToBuffer typing demands ReactElement<DocumentProps> at the top level;
  // our wrapper renders a Document internally so this cast is safe.
  const pdfBuffer = await renderToBuffer(
    pdfElement as unknown as Parameters<typeof renderToBuffer>[0]
  );

  return {
    pdfBuffer,
    pdfFilename: `halostar-90day-reading.pdf`,
    emailSubject: `your halostar 90-day reading ✦`,
    emailBody: `your reading's attached, bestie.\n\nfor the next 90 days, written for the ${currentDasha.planet} mahadasha you're walking through. read it slow.\n\n— halostar\nhalostar.in`,
  };
}

// ----- compatibility ₹199 → full report -----

async function generateMatchPdf(boy: BirthData, girl: BirthData) {
  const [ashtakoot, boyMoonSign, girlMoonSign, boyMangal, girlMangal] = await Promise.all([
    getAshtakoot(boy, girl),
    getMoonSign(boy),
    getMoonSign(girl),
    getMangalDosha(boy),
    getMangalDosha(girl),
  ]);

  const userPrompt = buildMatchPdfUserPrompt({
    ashtakoot,
    boyMoonSign,
    girlMoonSign,
    boyMangal,
    girlMangal,
    boyLabel: `${boy.place} · ${boy.dob}, ${boy.tob}`,
    girlLabel: `${girl.place} · ${girl.dob}, ${girl.tob}`,
  });

  const content = await generateJson<MatchPdfContent>(MATCH_PDF_SYSTEM, userPrompt, {
    model: MODELS.pdf,
    cacheSystem: true,
    maxTokens: 8000,
    temperature: 0.85,
  });

  const generatedDateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pdfElement = React.createElement(MatchProPdf, {
    content,
    boyLabel: `${boy.place} · ${boy.dob} at ${boy.tob}`,
    girlLabel: `${girl.place} · ${girl.dob} at ${girl.tob}`,
    ashtakootRaw: ashtakoot.total,
    generatedDateLabel,
  });
  // react-pdf's renderToBuffer typing demands ReactElement<DocumentProps> at the top level;
  // our wrapper renders a Document internally so this cast is safe.
  const pdfBuffer = await renderToBuffer(
    pdfElement as unknown as Parameters<typeof renderToBuffer>[0]
  );

  return {
    pdfBuffer,
    pdfFilename: `halostar-compatibility-report.pdf`,
    emailSubject: `your halostar compatibility report ✦`,
    emailBody: `your full compatibility report is attached.\n\nashtakoot ${ashtakoot.total}/36, all 8 koots broken down, mangal/nadi check, marriage timing, and the fight-without-breakup decoder.\n\nshare with your group chat. or your in-laws. up to you.\n\n— halostar\nhalostar.in`,
  };
}
