import { NextResponse } from "next/server";
import { generateJson } from "@/lib/claude";
import { getAshtakoot, getMoonSign } from "@/lib/vedic";
import { COMPATIBILITY_SYSTEM, buildCompatibilityUserPrompt } from "@/lib/prompts/compatibility";
import type { CompatibilityVibe, MatchRequest, VibeCheckRequest } from "@/types/vedic";

export const runtime = "nodejs";
export const maxDuration = 30;

const DOB_RE = /^\d{2}\/\d{2}\/\d{4}$/;
const TOB_RE = /^\d{2}:\d{2}$/;

function validateBirth(b: unknown, who: string): VibeCheckRequest {
  if (!b || typeof b !== "object") throw new Error(`${who}: invalid`);
  const r = b as Record<string, unknown>;
  const dob = String(r.dob ?? "");
  const tob = String(r.tob ?? "");
  const lat = Number(r.lat);
  const lon = Number(r.lon);
  const tz = Number(r.tz);
  const place = String(r.place ?? "");
  if (!DOB_RE.test(dob)) throw new Error(`${who}: dob must be dd/mm/yyyy`);
  if (!TOB_RE.test(tob)) throw new Error(`${who}: tob must be HH:mm`);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error(`${who}: invalid lat`);
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error(`${who}: invalid lon`);
  if (!Number.isFinite(tz) || tz < -12 || tz > 14) throw new Error(`${who}: invalid tz`);
  if (!place) throw new Error(`${who}: place required`);
  return { dob, tob, lat, lon, tz, place };
}

export async function POST(req: Request) {
  let parsed: MatchRequest;
  try {
    const json = (await req.json()) as { boy?: unknown; girl?: unknown };
    parsed = { boy: validateBirth(json.boy, "person 1"), girl: validateBirth(json.girl, "person 2") };
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }

  try {
    const [ashtakoot, boyMoonSign, girlMoonSign] = await Promise.all([
      getAshtakoot(parsed.boy, parsed.girl),
      getMoonSign(parsed.boy),
      getMoonSign(parsed.girl),
    ]);

    const userPrompt = buildCompatibilityUserPrompt({ ashtakoot, boyMoonSign, girlMoonSign });

    const ai = await generateJson<{
      matchPercent: number;
      pillars: {
        vibeSync: { score: number; line: string };
        communication: { score: number; line: string };
        longGame: { score: number; line: string };
      };
      verdict: string;
    }>(COMPATIBILITY_SYSTEM, userPrompt, {
      cacheSystem: true,
      maxTokens: 700,
      temperature: 0.9,
    });

    const result: CompatibilityVibe = {
      ...ai,
      reference: {
        boyMoonSign: boyMoonSign.moon_sign,
        girlMoonSign: girlMoonSign.moon_sign,
        ashtakootRaw: ashtakoot.total,
      },
    };

    return NextResponse.json({ ok: true, match: result });
  } catch (e) {
    console.error("[match]", e);
    return NextResponse.json(
      { ok: false, error: "couldn't read the match rn. try again?" },
      { status: 500 }
    );
  }
}
