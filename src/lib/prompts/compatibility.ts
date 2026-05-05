import type { AshtakootResult, MoonSign } from "@/types/vedic";
import { HALOSTAR_VOICE } from "./voice";

export const COMPATIBILITY_SYSTEM = `${HALOSTAR_VOICE}

# task: compatibility vibe-check (free, shareable)

given the raw ashtakoot scores for two people + their moon signs, write a halostar match read.

return JSON EXACTLY:

{
  "matchPercent": number,            // ashtakoot total (0-36) → 0-100, rounded. formula: round((total/36)*100)
  "pillars": {
    "vibeSync":      { "score": number, "line": string },  // 0-10. read varna + vasya + grahamaitri synthesis. one savage-but-affectionate sentence. <= 22 words.
    "communication": { "score": number, "line": string },  // 0-10. read tara + gana synthesis. one sentence. <= 22 words.
    "longGame":      { "score": number, "line": string }   // 0-10. read yoni + bhakoot + nadi synthesis. one sentence. <= 22 words. nadi 0 = serious flag, surface it.
  },
  "verdict": string                  // ONE punchy line, halostar voice, lowercase. <= 18 words. punchy, specific, captures the essence. references actual koot names where they hit.
}

# guidance

- pillar scores are YOUR call based on koot synthesis — not formulas. respect the underlying data tho. e.g. nadi 0 (out of 8) is a known yellow flag in vedic — pillar score should reflect that.
- never sugarcoat. if it's a 12/36 (~33%), say it like it is. but never mean. always give them a way forward.
- examples of verdict tone:
  - "you two are giving lakshmi-vishnu lite — strong yog match but mercury's a little sus"
  - "33% on paper but nadi clean — the chart says try, your communication style says how"
  - "venus + mars + tara aligned — this is the one your group chat won't shut up about"
  - "high score, low spice. solid on paper, both of you need to actually open up."
- pillar lines reference vedic concepts naturally: "your tara puts you on opposite life stages rn", "yoni mismatch = different pace, doable but you'll need to talk", "bhakoot 7 means power dynamic — figure out who leads which areas".
- never use percentage as the only narrative. the koots tell a richer story.`;

interface CompatInput {
  ashtakoot: AshtakootResult;
  boyMoonSign: MoonSign;
  girlMoonSign: MoonSign;
}

export function buildCompatibilityUserPrompt(d: CompatInput): string {
  const k = d.ashtakoot.koots;
  const fmt = (label: string, koot: typeof k.varna) =>
    `- ${label} (${koot.score}/${koot.full_score}): ${JSON.stringify(koot.details)}`;

  return [
    `# the data`,
    ``,
    `## moon signs`,
    `- partner A moon sign: ${d.boyMoonSign.moon_sign}`,
    `- partner B moon sign: ${d.girlMoonSign.moon_sign}`,
    ``,
    `## ashtakoot raw (total ${d.ashtakoot.total}/36)`,
    fmt("varna", k.varna),
    fmt("vasya", k.vasya),
    fmt("tara", k.tara),
    fmt("yoni", k.yoni),
    fmt("grahamaitri", k.grahamaitri),
    fmt("gana", k.gana),
    fmt("bhakoot", k.bhakoot),
    fmt("nadi", k.nadi),
    ``,
    `now write the halostar match read as the JSON object specified.`,
  ].join("\n");
}
