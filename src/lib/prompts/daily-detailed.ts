import type {
  CurrentDasha,
  MoonSign,
  Panchang,
  PlanetPosition,
} from "@/types/vedic";
import { HALOSTAR_VOICE } from "./voice";

export const DAILY_DETAILED_SYSTEM = `${HALOSTAR_VOICE}

# task: daily horoscope — fully unlocked (paid: ₹19)

this is the unlock the user paid for. it's the SAME daily horoscope they just read, but every segment expanded to full detail. premium voice, premium specificity. the bar: "i feel insanely seen, i'm sending this to four friends."

return a JSON object EXACTLY in this shape — no extra keys, no markdown fences, no commentary:

{
  "title": string,                     // ONE evocative line. <= 12 words. lowercase + serif-italic energy. captures today's whole vibe.
  "intro": string,                     // 3-5 sentence opening that names today's panchang specifics + the user's current mahadasha and what those two things together mean for the next 24h. anchored, not generic.
  "sections": {
    "love":          { "detail": string, "moves": string[] },
    "relationships": { "detail": string, "moves": string[] },
    "work":          { "detail": string, "moves": string[] },
    "finance":       { "detail": string, "moves": string[] },
    "health":        { "detail": string, "moves": string[] },
    "mindset":       { "detail": string, "moves": string[] }
  },
  "luckyWindow": string,               // halostar voice, 1-2 sentences. "between 4–7pm today, if you're going to do the brave thing, do it then." use the day's actual hora / good muhurta logic.
  "avoidWindow": string,               // halostar voice, 1-2 sentences. "rahu kalam mid-morning — don't sign anything you can't unsign." real.
  "mantra": string,                    // ONE punchy 1-line affirmation in halostar voice. lowercase. <= 14 words. usable today.
  "closingNote": string                // 2-3 sentence sign-off. warm, specific, never generic. tie back to the dasha lord by name.
}

# section rules (apply to all 6 sections)

each "detail" field:
- 3-5 sentences (50-90 words). prose, not bullets.
- ground in TODAY'S actual nakshatra OR tithi OR yoga AND the user's mahadasha lord.
- be specific: name a planet, name a koot, name a window of time, name a behaviour.
- never generic horoscope-mush. if it would fit any random person, rewrite it.

each "moves" field:
- 2-4 imperative tilts the user can do TODAY.
- each <= 18 words. lowercase. start with a verb.
- example: "send the voice note. don't overthink the tone."
- example: "delete one app from your phone before lunch."

# voice rules (apply everywhere)
- lowercase except proper nouns
- mumbai indian gen z. dashes + fragments + voice-fluency. "bestie", "real", "ngl", "literally" used sparingly.
- reference vedic terms confidently (mahadasha, antardasha, nakshatra, tithi, gochar, dasha lord) without defining them.
- never use emoji. never use markdown.
- second person throughout — talking TO the user, not about them.

JSON only at the top level. nothing else.`;

interface DailyDetailedInput {
  birthLabel: string;
  panchang: Panchang;
  moonSign: MoonSign;
  currentDasha: CurrentDasha;
  planets: PlanetPosition[];
  forDate: Date;
}

export function buildDailyDetailedUserPrompt(d: DailyDetailedInput): string {
  const ascendant = d.planets.find(
    (p) => p.name === "As" || p.full_name === "Ascendant"
  );
  const sun = d.planets.find((p) => p.name === "Su" || p.full_name === "Sun");
  const moon = d.planets.find((p) => p.name === "Mo" || p.full_name === "Moon");
  const venus = d.planets.find((p) => p.name === "Ve" || p.full_name === "Venus");
  const mars = d.planets.find((p) => p.name === "Ma" || p.full_name === "Mars");
  const mercury = d.planets.find((p) => p.name === "Me" || p.full_name === "Mercury");
  const saturn = d.planets.find((p) => p.name === "Sa" || p.full_name === "Saturn");
  const jupiter = d.planets.find((p) => p.name === "Ju" || p.full_name === "Jupiter");

  const fmtP = (p?: PlanetPosition, label?: string) =>
    p
      ? `- ${label ?? p.full_name}: ${p.zodiac ?? "?"} sign, house ${p.house ?? "?"}${p.nakshatra ? `, nakshatra ${p.nakshatra}` : ""}${p.retro === "true" ? " [retrograde]" : ""}`
      : "";

  const dateStr = d.forDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return [
    `# today — ${dateStr}`,
    ``,
    `## today's panchang`,
    `- vara: ${d.panchang.day.name}`,
    `- tithi: ${d.panchang.tithi.name} (${d.panchang.tithi.type}), deity ${d.panchang.tithi.diety}. meaning: ${d.panchang.tithi.meaning}. special: ${d.panchang.tithi.special}`,
    `- nakshatra: ${d.panchang.nakshatra.name} (lord ${d.panchang.nakshatra.lord}, deity ${d.panchang.nakshatra.diety}, pada ${d.panchang.nakshatra.pada})${d.panchang.nakshatra.summary ? ` — ${d.panchang.nakshatra.summary}` : ""}`,
    `- karana: ${d.panchang.karana.name} (${d.panchang.karana.type})${d.panchang.karana.special ? ` — ${d.panchang.karana.special}` : ""}`,
    `- yoga: ${d.panchang.yoga.name}${d.panchang.yoga.special ? ` — ${d.panchang.yoga.special}` : ""}`,
    ``,
    `## user's chart`,
    `- birth: ${d.birthLabel}`,
    `- moon sign (rashi): ${d.moonSign.moon_sign}`,
    fmtP(ascendant, "ascendant (lagna)"),
    fmtP(sun, "Sun"),
    fmtP(moon, "Moon"),
    fmtP(mercury, "Mercury"),
    fmtP(venus, "Venus"),
    fmtP(mars, "Mars"),
    fmtP(jupiter, "Jupiter"),
    fmtP(saturn, "Saturn"),
    ``,
    `## current vimshottari mahadasha`,
    `- mahadasha lord: ${d.currentDasha.planet}`,
    `- started: ${new Date(d.currentDasha.startDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
    `- ending: ${new Date(d.currentDasha.endDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`,
    `- remaining: ${d.currentDasha.remaining}`,
    ``,
    `now write the fully-unlocked daily horoscope as the JSON object specified. every field, every section. anchored in this exact data.`,
  ]
    .filter(Boolean)
    .join("\n");
}
