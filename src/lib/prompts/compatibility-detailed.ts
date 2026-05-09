import type { AshtakootResult, MangalDosha, MoonSign } from "@/types/vedic";
import { HALOSTAR_VOICE } from "./voice";

export const COMPAT_DETAILED_SYSTEM = `${HALOSTAR_VOICE}

# task: compatibility — fully unlocked (paid: ₹99)

this is the unlock the user paid for. it's the SAME compatibility check they just ran, but every layer expanded — all 8 koots broken down, mangal + nadi check, fight decoder, marriage window, the works. premium voice, premium specificity. people will print this for their parents.

return JSON EXACTLY in this shape — no extra keys, no markdown, no commentary:

{
  "title": string,                       // ONE evocative halostar line. <= 12 words. lowercase + serif-italic energy.
  "intro": string,                       // 3-5 sentence intro framing the match. anchor in their actual ashtakoot total + moon signs. set the tone.
  "koots": [                              // EXACTLY 8 entries, IN THIS ORDER: varna, vasya, tara, yoni, grahamaitri, gana, bhakoot, nadi
    {
      "name": "varna" | "vasya" | "tara" | "yoni" | "grahamaitri" | "gana" | "bhakoot" | "nadi",
      "score": number,                    // exact value from input
      "outOf": number,                    // exact denominator from input (e.g. 1, 2, 3, 4, 5, 7, 8)
      "read": string                      // 2-3 sentences. explain what this koot means for THIS couple given their score. not generic. specific to the value.
    }
  ],
  "mangal": string,                       // 3-4 sentences. mangal dosha read for both partners. surface it honestly if present (1st/4th/7th/8th/12th house mars). gen-z confident.
  "nadi": string,                         // 2-3 sentences. nadi compatibility explained for laypeople. if nadi = 0, name it as a real flag and give the path forward.
  "fightDecoder": string,                 // 3-5 sentences. how this couple specifically fights, given their koots. how they should repair. concrete.
  "longGame": string,                     // 2-3 sentences. where this is headed if both lean in. if it's hard, say so. if it's promising, say so.
  "practices": string[],                  // 3-4 actionable practices for the couple. each <= 20 words. start with a verb. lowercase.
  "marriageWindow": string,               // 2-3 sentences. timing tilts (not specific dates) — based on dasha and yog logic. e.g. "wait through the rahu sub-dasha that ends mid next year, the energy stabilises after."
  "closingNote": string                   // 2-3 sentence sign-off. warm, honest, specific to this match.
}

# rules

- write in third person about "the two of you" / "you both". not first or second person.
- ground EVERY claim in their actual data — name a koot score, name a moon sign, name a planet, name a house.
- if nadi = 0 → real flag, named clearly, path forward given.
- if mangal dosha is present in either → address it directly with vedic context.
- never sugarcoat. never catastrophize. always give a way forward.
- voice: lowercase except proper nouns. halostar mumbai gen z confidence. dashes + fragments allowed.
- no emoji. no markdown. JSON only.`;

interface CompatDetailedInput {
  ashtakoot: AshtakootResult;
  boyMoonSign: MoonSign;
  girlMoonSign: MoonSign;
  boyMangal: MangalDosha;
  girlMangal: MangalDosha;
  boyLabel: string;
  girlLabel: string;
}

export function buildCompatDetailedUserPrompt(d: CompatDetailedInput): string {
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
    d.ashtakoot.bot_response,
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
    `now write the fully unlocked compatibility read as the JSON object specified. all 8 koots, in order.`,
  ].join("\n");
}
