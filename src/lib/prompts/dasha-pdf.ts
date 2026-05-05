import type { CurrentDasha, MahaDasha, MoonSign, PlanetPosition } from "@/types/vedic";
import { HALOSTAR_VOICE } from "./voice";

export const DASHA_PDF_SYSTEM = `${HALOSTAR_VOICE}

# task: 90-day dasha reading PDF (paid: ₹19)

this is the unlock the user paid for. it's the LONG read — premium voice, premium specificity, premium length. the bar is "i feel insanely seen, i'm sending this to four friends."

write a 90-day vedic-grounded reading in halostar voice. structure exactly as the JSON below.

{
  "title": string,                       // ONE evocative line in halostar voice. <= 12 words. lowercase + serif-italic energy.
  "openingLetter": string,               // 3-5 short paragraphs (8-12 sentences total). open with the user's current mahadasha + sub-dasha as if writing them a letter. acknowledge the energy they're walking into. set the tone for the next 90 days. mix vedic concepts (mahadasha, antardasha, gochar, moon sign) with halostar voice. not generic — anchored in actual data.
  "weeks": [                             // exactly 13 weeks. each one a single tight paragraph (3-5 sentences) in halostar voice. one specific tilt per week — work, love, money, health, social. don't use the same area 3 weeks in a row. ground in the underlying dasha.
    {
      "weekNumber": number,              // 1 through 13
      "dateRange": string,               // "May 5 — May 11" style
      "headline": string,                // <= 8 words, halostar voice, lowercase
      "body": string                     // 3-5 sentence paragraph
    }
    // ... 13 entries total
  ],
  "warnings": [                          // 2-3 short flags about pitfalls in this dasha period. real but not catastrophizing. each <= 25 words.
    string
  ],
  "openings": [                          // 2-3 specific tilts the user should LEAN INTO during this dasha. each <= 25 words.
    string
  ],
  "closingNote": string                  // a 2-3 sentence sign-off in halostar voice. warm, specific, never generic.
}

# rules
- write in second person, as if speaking to the user
- reference the user's actual current mahadasha by planet name
- weave in moon-sign and ascendant context where it adds specificity
- use real vedic terms confidently — never define them
- format: pure prose. no bullet points within the body fields. no markdown. JSON only at the top level.
- voice: lowercase except proper nouns. dashes + fragments + voice-fluency. mumbai indian gen z.`;

interface DashaPdfInput {
  birthLabel: string;
  moonSign: MoonSign;
  mahaDasha: MahaDasha;
  currentDasha: CurrentDasha;
  planets: PlanetPosition[];
  fromDate: Date;
}

export function buildDashaPdfUserPrompt(d: DashaPdfInput): string {
  const ascendant = d.planets.find((p) => p.name === "As" || p.full_name === "Ascendant");
  const sun = d.planets.find((p) => p.name === "Su" || p.full_name === "Sun");
  const moon = d.planets.find((p) => p.name === "Mo" || p.full_name === "Moon");
  const venus = d.planets.find((p) => p.name === "Ve" || p.full_name === "Venus");
  const mars = d.planets.find((p) => p.name === "Ma" || p.full_name === "Mars");
  const saturn = d.planets.find((p) => p.name === "Sa" || p.full_name === "Saturn");

  const fmtP = (p?: PlanetPosition, label?: string) =>
    p ? `- ${label ?? p.full_name}: ${p.zodiac ?? "?"} sign, house ${p.house ?? "?"}${p.nakshatra ? `, nakshatra ${p.nakshatra}` : ""}${p.retro === "true" ? " [retrograde]" : ""}` : "";

  return [
    `# user's chart context`,
    `- birth: ${d.birthLabel}`,
    `- moon sign (rashi): ${d.moonSign.moon_sign}`,
    fmtP(ascendant, "ascendant (lagna)"),
    fmtP(sun, "Sun"),
    fmtP(moon, "Moon"),
    fmtP(venus, "Venus"),
    fmtP(mars, "Mars"),
    fmtP(saturn, "Saturn"),
    ``,
    `# current vimshottari mahadasha`,
    `- mahadasha lord: ${d.currentDasha.planet}`,
    `- started: ${new Date(d.currentDasha.startDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
    `- ending: ${new Date(d.currentDasha.endDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
    `- remaining: ${d.currentDasha.remaining}`,
    ``,
    `# 90-day window`,
    `- from: ${d.fromDate.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
    `- to: ${new Date(d.fromDate.getTime() + 90 * 86400_000).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
    ``,
    `now write the 90-day reading as the JSON object specified.`,
  ].filter(Boolean).join("\n");
}

export interface DashaPdfContent {
  title: string;
  openingLetter: string;
  weeks: Array<{ weekNumber: number; dateRange: string; headline: string; body: string }>;
  warnings: string[];
  openings: string[];
  closingNote: string;
}
