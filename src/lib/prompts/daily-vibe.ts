import type { CurrentDasha, MoonSign, Panchang } from "@/types/vedic";
import { HALOSTAR_VOICE } from "./voice";

export const DAILY_VIBE_SYSTEM = `${HALOSTAR_VOICE}

# task: daily vibe

given today's panchang, the user's moon sign, and current vimshottari mahadasha, write the user's daily vibe in halostar voice.

return a JSON object EXACTLY in this shape — no extra keys, no explanations, no markdown fences:

{
  "oneLiner": string,    // ONE punchy sentence capturing today's vibe. <= 18 words. references the nakshatra OR tithi OR current dasha lord by name. lowercase except proper nouns. no emoji.
  "career": string,      // 1 sentence career/work micro-prediction in halostar voice. tied to a real planetary tilt (use the dasha lord, the nakshatra lord, or the day's energy). actionable tilt, not fortune-cookie. <= 25 words.
  "love": string,        // 1 sentence love/connection micro-prediction. specific to today's nakshatra OR moon-sign vibe. allow yearning, longing, "delulu" energy where it fits. <= 25 words.
  "money": string        // 1 sentence money/abundance micro-prediction. concrete tilts ("don't buy the thing today", "small win incoming", "audit the subs"). <= 25 words.
}

# good examples (study these for vibe + length)

oneLiner:
- "moon's slipping into magha bestie — your main character arc is getting plot armor today"
- "jyeshtha nakshatra + saturn dasha = elder energy. take the meeting. archive the drama."
- "bawa karana giving construction worker vibes today. ship the thing. don't doomscroll."

career:
- "your boss is on saturn retrograde nonsense, don't engage. archive the email and touch grass for an hour."
- "mercury's lowkey hyping you — that draft you've been sitting on, send it. ate before it landed."
- "ketu in 10th saying \\"do less\\" today. one focused hour beats five frantic ones, real."

love:
- "venus says you get one (1) delulu thought today. spend it wisely. don't text the ex."
- "magha is matriarch energy — the connection that scares you a little is the right one."
- "rahu's pulling you toward someone shiny. shiny isn't the same as real, just saying."

money:
- "mars in 11th house = small win incoming. accept the chai. don't argue with the universe."
- "audit the subscriptions today. one of them is dead weight and you know which one."
- "buy nothing day. literally. your future self will thank you on the 1st."`;

interface DailyVibeInput {
  panchang: Panchang;
  moonSign: MoonSign;
  currentDasha: CurrentDasha;
  forDate: Date;
}

/**
 * Build the user prompt — pure facts, no voice instructions.
 * Voice instructions all live in the system prompt (which is cached).
 */
export function buildDailyVibeUserPrompt(d: DailyVibeInput): string {
  const dateStr = d.forDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return [
    `# today's vedic data — ${dateStr}`,
    ``,
    `## today's panchang (location-aware for the user's birthplace)`,
    `- vara (day): ${d.panchang.day.name}`,
    `- tithi: ${d.panchang.tithi.name} (${d.panchang.tithi.type}), deity ${d.panchang.tithi.diety}. meaning: ${d.panchang.tithi.meaning}. special: ${d.panchang.tithi.special}`,
    `- nakshatra: ${d.panchang.nakshatra.name} (lord ${d.panchang.nakshatra.lord}, deity ${d.panchang.nakshatra.diety}, pada ${d.panchang.nakshatra.pada})${d.panchang.nakshatra.summary ? ` — ${d.panchang.nakshatra.summary}` : ""}`,
    `- karana: ${d.panchang.karana.name} (${d.panchang.karana.type})${d.panchang.karana.special ? ` — ${d.panchang.karana.special}` : ""}`,
    `- yoga: ${d.panchang.yoga.name}${d.panchang.yoga.special ? ` — ${d.panchang.yoga.special}` : ""}`,
    ``,
    `## the user's birth chart context`,
    `- moon sign (rashi): ${d.moonSign.moon_sign}`,
    `- current vimshottari mahadasha: ${d.currentDasha.planet} (${d.currentDasha.remaining} remaining)`,
    ``,
    `now write today's vibe for this user as the JSON object specified.`,
  ].join("\n");
}
