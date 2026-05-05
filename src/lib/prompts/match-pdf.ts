import type { AshtakootResult, MangalDosha, MoonSign } from "@/types/vedic";
import { HALOSTAR_VOICE } from "./voice";

export const MATCH_PDF_SYSTEM = `${HALOSTAR_VOICE}

# task: full compatibility report PDF (paid: ₹199)

this is the unlock for serious couples / serious overthinkers. premium voice, premium specificity, premium length. people will print this for their parents.

return JSON EXACTLY:

{
  "title": string,                                 // <= 12 words. halostar voice. evocative, lowercase.
  "headline": string,                              // ONE serif-italic-worthy line capturing the relationship. <= 18 words.
  "ashtakootBreakdown": [                          // exactly 8 entries — one per koot. each is a richer essay-paragraph, NOT a one-liner.
    {
      "koot": "varna" | "vasya" | "tara" | "yoni" | "grahamaitri" | "gana" | "bhakoot" | "nadi",
      "scoreLabel": string,                         // e.g. "1.0 / 1" — exact from input
      "title": string,                              // <= 8 words, halostar voice
      "explanation": string,                        // 4-6 sentences. explain what this koot represents, what THEIR specific values mean, what to do about it. mix vedic with gen z without losing depth.
    }
    // 8 total — IN THIS ORDER: varna, vasya, tara, yoni, grahamaitri, gana, bhakoot, nadi
  ],
  "doshaCheck": {
    "summary": string,                              // 2-3 sentences on overall dosha picture
    "mangalNote": string,                           // 2-3 sentences on mangal dosha presence/absence and what it means here
    "nadiNote": string                              // 2-3 sentences on nadi compatibility — flag seriously if nadi=0
  },
  "marriageTimingWindow": {
    "headline": string,                             // halostar voice, <= 14 words
    "body": string                                  // 4-6 sentences — based on nakshatra/dasha tilts, suggest favorable upcoming windows. not specific dates, but tilts ("after the venus sub-dasha lifts in late next year", etc.)
  },
  "fightDecoder": {                                  // "fight without breakup" decoder
    "headline": string,                             // <= 12 words
    "intro": string,                                 // 2-3 sentence intro: how/why these two fight given their koots
    "patterns": [                                    // 3-4 SPECIFIC fight patterns predicted from their chart, each with a fix
      { "trigger": string, "spiral": string, "deescalation": string }
    ]
  },
  "verdict": {
    "headline": string,                             // <= 14 words. ONE punchy halostar verdict line.
    "body": string                                   // 3-5 sentences. honest summary. specific. encouraging without being saccharine.
  }
}

# rules
- this is paid content. it MUST be deeper, sharper, longer than the free version.
- write in third person about "the two of you" / "you both" — not first or second.
- reference the actual koot scores by name and number.
- if nadi = 0, surface it honestly. don't catastrophize, don't sugarcoat. give the path forward.
- if mangal dosha is present in either, address it directly with vedic context (12th/1st/4th/7th/8th house mars).
- voice: lowercase, halostar gen z + real vedic confidence. mumbai indian audience.
- format: JSON only. no markdown in fields. no fences.`;

interface MatchPdfInput {
  ashtakoot: AshtakootResult;
  boyMoonSign: MoonSign;
  girlMoonSign: MoonSign;
  boyMangal: MangalDosha;
  girlMangal: MangalDosha;
  boyLabel: string;
  girlLabel: string;
}

export function buildMatchPdfUserPrompt(d: MatchPdfInput): string {
  const k = d.ashtakoot.koots;
  const fmt = (label: string, koot: typeof k.varna) =>
    `- ${label} (${koot.score}/${koot.full_score}): ${JSON.stringify(koot.details)}`;

  return [
    `# the data`,
    ``,
    `## people`,
    `- partner A: ${d.boyLabel} — moon sign ${d.boyMoonSign.moon_sign}`,
    `- partner B: ${d.girlLabel} — moon sign ${d.girlMoonSign.moon_sign}`,
    ``,
    `## ashtakoot total: ${d.ashtakoot.total} / 36`,
    `${d.ashtakoot.bot_response}`,
    ``,
    `## koot breakdown`,
    fmt("varna", k.varna),
    fmt("vasya", k.vasya),
    fmt("tara", k.tara),
    fmt("yoni", k.yoni),
    fmt("grahamaitri", k.grahamaitri),
    fmt("gana", k.gana),
    fmt("bhakoot", k.bhakoot),
    fmt("nadi", k.nadi),
    ``,
    `## mangal dosha`,
    `- partner A mangal: ${JSON.stringify(d.boyMangal)}`,
    `- partner B mangal: ${JSON.stringify(d.girlMangal)}`,
    ``,
    `now write the full compatibility report as the JSON object specified.`,
  ].join("\n");
}

export interface MatchPdfContent {
  title: string;
  headline: string;
  ashtakootBreakdown: Array<{
    koot: "varna" | "vasya" | "tara" | "yoni" | "grahamaitri" | "gana" | "bhakoot" | "nadi";
    scoreLabel: string;
    title: string;
    explanation: string;
  }>;
  doshaCheck: { summary: string; mangalNote: string; nadiNote: string };
  marriageTimingWindow: { headline: string; body: string };
  fightDecoder: {
    headline: string;
    intro: string;
    patterns: Array<{ trigger: string; spiral: string; deescalation: string }>;
  };
  verdict: { headline: string; body: string };
}
