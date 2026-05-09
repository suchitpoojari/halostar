import { NextResponse } from "next/server";
import { generateJson } from "@/lib/claude";
import {
  computeCurrentDasha,
  getMahaDasha,
  getMoonSign,
  getPanchang,
} from "@/lib/vedic";
import { DAILY_VIBE_SYSTEM, buildDailyVibeUserPrompt } from "@/lib/prompts/daily-vibe";
import type {
  BirthData,
  DailyVibe,
  DailyVibeOverview,
  VibeCheckRequest,
} from "@/types/vedic";

export const runtime = "nodejs";
export const maxDuration = 30;

const DOB_RE = /^\d{2}\/\d{2}\/\d{4}$/;
const TOB_RE = /^\d{2}:\d{2}$/;

function validate(body: unknown): VibeCheckRequest {
  if (!body || typeof body !== "object") throw new Error("invalid body");
  const r = body as Record<string, unknown>;
  const dob = String(r.dob ?? "");
  const tob = String(r.tob ?? "");
  const lat = Number(r.lat);
  const lon = Number(r.lon);
  const tz = Number(r.tz);
  const place = String(r.place ?? "");

  if (!DOB_RE.test(dob)) throw new Error('dob must be "dd/mm/yyyy"');
  if (!TOB_RE.test(tob)) throw new Error('tob must be "HH:mm"');
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error("invalid lat");
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error("invalid lon");
  if (!Number.isFinite(tz) || tz < -12 || tz > 14) throw new Error("invalid tz");
  if (!place) throw new Error("place required");

  return { dob, tob, lat, lon, tz, place };
}

export async function POST(req: Request) {
  let parsed: VibeCheckRequest;
  try {
    const json = await req.json();
    parsed = validate(json);
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }

  const birth: BirthData = parsed;
  const today = new Date();

  try {
    const [panchang, moonSign, mahaDasha] = await Promise.all([
      getPanchang(today, birth.lat, birth.lon, birth.tz),
      getMoonSign(birth),
      getMahaDasha(birth),
    ]);

    const currentDasha = computeCurrentDasha(mahaDasha, today);

    const userPrompt = buildDailyVibeUserPrompt({
      panchang,
      moonSign,
      currentDasha,
      forDate: today,
    });

    const ai = await generateJson<{
      oneLiner: string;
      overview: DailyVibeOverview;
    }>(DAILY_VIBE_SYSTEM, userPrompt, {
      cacheSystem: true,
      maxTokens: 900,
      temperature: 0.95,
    });

    const vibe: DailyVibe = {
      oneLiner: ai.oneLiner,
      overview: ai.overview,
      reference: {
        nakshatra: panchang.nakshatra.name,
        nakshatraLord: panchang.nakshatra.lord,
        tithi: `${panchang.tithi.name} (${panchang.tithi.type})`,
        moonSign: moonSign.moon_sign,
        currentDasha: `${currentDasha.planet} mahadasha (${currentDasha.remaining} left)`,
      },
      forDate: today.toISOString().slice(0, 10),
    };

    return NextResponse.json({ ok: true, vibe });
  } catch (e) {
    console.error("[vibe-check]", e);
    return NextResponse.json(
      { ok: false, error: "couldn't read your chart rn. try again?" },
      { status: 500 }
    );
  }
}
