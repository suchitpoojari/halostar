// types matching vedicastroapi.com v3-json responses + halostar internal shapes

export interface BirthData {
  /** dd/mm/yyyy as required by vedicastroapi */
  dob: string;
  /** HH:mm 24h as required by vedicastroapi */
  tob: string;
  lat: number;
  lon: number;
  /** decimal hours, e.g. 5.5 for IST */
  tz: number;
  /** human-readable place, e.g. "Mumbai, India" */
  place: string;
}

export interface GeoPlace {
  display_name: string;
  label: string;
  lat: number;
  lon: number;
}

// --- panchang ---

export interface Panchang {
  day: { name: string };
  tithi: PanchangTithi;
  nakshatra: PanchangNakshatra;
  karana: PanchangKarana;
  yoga: PanchangYoga;
}

export interface PanchangTithi {
  name: string;
  number: number;
  next_tithi: string;
  type: "Krishna" | "Shukla" | string;
  diety: string;
  start: string;
  end: string;
  meaning: string;
  special: string;
}

export interface PanchangNakshatra {
  pada: number;
  name: string;
  number: number;
  lord: string;
  diety: string;
  start: string;
  next_nakshatra: string;
  end: string;
  auspicious_disha?: string[];
  meaning?: string;
  special?: string;
  summary?: string;
}

export interface PanchangKarana {
  name: string;
  number: number;
  type: string;
  lord: string;
  diety: string;
  start: string;
  end: string;
  special?: string;
  next_karana?: string;
}

export interface PanchangYoga {
  name: string;
  number: number;
  start: string;
  end: string;
  special?: string;
  meaning?: string;
}

// --- moon sign ---

export interface MoonSign {
  moon_sign: string;
  bot_response: string;
  prediction: string;
}

// --- vimshottari dasha ---

export interface MahaDasha {
  mahadasha: string[];
  mahadasha_order: string[];
  start_year: number;
  dasha_start_date: string;
  dasha_remaining_at_birth: string;
}

export interface CurrentDasha {
  planet: string;
  startDate: string;
  endDate: string;
  remaining: string;
}

// --- birth chart planets ---

export interface PlanetPosition {
  name: string;
  full_name: string;
  local_degree: number;
  global_degree: number;
  current_sign?: number | string;
  zodiac?: string;
  house?: number;
  retro?: "true" | "false";
  nakshatra?: string;
  nakshatra_lord?: string;
  zodiac_lord?: string;
}

// --- doshas ---

export interface MangalDosha {
  factors?: Record<string, string>;
  is_present?: boolean;
  is_dosha_present?: boolean;
  bot_response?: string;
  description?: string;
}

// --- ashtakoot matching ---

export interface AshtakootKoot {
  name: string;
  description: string;
  full_score: number;
  score: number;
  details: Record<string, string | number>;
}

export interface AshtakootResult {
  total: number;
  outOf: 36;
  bot_response: string;
  koots: {
    varna: AshtakootKoot;
    vasya: AshtakootKoot;
    tara: AshtakootKoot;
    yoni: AshtakootKoot;
    grahamaitri: AshtakootKoot;
    gana: AshtakootKoot;
    bhakoot: AshtakootKoot;
    nadi: AshtakootKoot;
  };
}

// --- daily vibe (free overview) ---

export type DailyVibeSegmentKey =
  | "love"
  | "relationships"
  | "work"
  | "finance"
  | "health"
  | "mindset";

export interface DailyVibeOverview {
  love: string;          // 1 sentence
  relationships: string; // 1 sentence (family / friends / chosen people — distinct from romantic love)
  work: string;          // 1 sentence (career / college / study)
  finance: string;       // 1 sentence (money / spending / abundance)
  health: string;        // 1 sentence (body / energy / sleep)
  mindset: string;       // 1 sentence (inner state / mood / focus)
}

export interface DailyVibe {
  oneLiner: string;
  forDate: string;
  overview: DailyVibeOverview;
  reference: {
    nakshatra: string;
    nakshatraLord: string;
    tithi: string;
    moonSign: string;
    currentDasha: string;
  };
}

// --- daily vibe (paid: fully detailed, revealed inline) ---

export interface DailyVibeDetailedSection {
  /** 3–5 sentence expansion of this segment's overview line. specific, actionable. */
  detail: string;
  /** 2–4 do-this-today tilts. each <= 18 words. */
  moves: string[];
}

export interface DailyVibeDetailed {
  /** the deeper headline that introduces the full reading. */
  title: string;
  /** 3–5 sentence opening that sets up today's energy in detail. */
  intro: string;
  sections: {
    love: DailyVibeDetailedSection;
    relationships: DailyVibeDetailedSection;
    work: DailyVibeDetailedSection;
    finance: DailyVibeDetailedSection;
    health: DailyVibeDetailedSection;
    mindset: DailyVibeDetailedSection;
  };
  luckyWindow: string;     // "best 2–3 hour window today, in halostar voice"
  avoidWindow: string;     // "the cursed window — when to lay low"
  mantra: string;          // a 1-line affirmation in halostar voice. lowercase.
  closingNote: string;     // 2–3 sentence sign-off.
}

export interface VibeCheckRequest {
  dob: string;
  tob: string;
  lat: number;
  lon: number;
  tz: number;
  place: string;
}

// --- compatibility (free overview) ---

export interface CompatibilityVibe {
  matchPercent: number;
  pillars: {
    vibeSync: { score: number; line: string };
    communication: { score: number; line: string };
    longGame: { score: number; line: string };
  };
  verdict: string;
  reference: {
    boyMoonSign: string;
    girlMoonSign: string;
    ashtakootRaw: number;
  };
}

// --- compatibility (paid: fully detailed) ---

export interface CompatibilityKootDetail {
  /** koot name as in vedic, e.g. "varna" */
  name: string;
  /** raw score we already have, displayed prominently */
  score: number;
  outOf: number;
  /** 2–3 sentence read on what this score means for *this couple*. */
  read: string;
}

export interface CompatibilityDetailed {
  title: string;
  /** 3–5 sentence intro framing the match in halostar voice. */
  intro: string;
  /** all 8 koots, one paragraph each. order: varna, vasya, tara, yoni, grahamaitri, gana, bhakoot, nadi */
  koots: CompatibilityKootDetail[];
  /** mangal dosha read for both partners. <= 4 sentences. */
  mangal: string;
  /** nadi check explained for laypeople. <= 3 sentences. */
  nadi: string;
  /** 3–5 sentences on how this couple fights and how to repair. */
  fightDecoder: string;
  /** 2–3 sentences on where this is headed if both lean in. */
  longGame: string;
  /** 3–4 actionable practices for the couple. each <= 20 words. */
  practices: string[];
  /** "if you're considering marriage" timing window read. <= 3 sentences. */
  marriageWindow: string;
  closingNote: string;
}

export interface MatchRequest {
  boy: VibeCheckRequest;
  girl: VibeCheckRequest;
}

// --- razorpay ---

export type UnlockProduct = "daily_vibe_unlock" | "compatibility_unlock";

export type UnlockPayload =
  | { kind: "daily_vibe"; birth: VibeCheckRequest }
  | { kind: "compatibility"; boy: VibeCheckRequest; girl: VibeCheckRequest };

export interface RazorpayOrderRequest {
  product: UnlockProduct;
  email: string;
  payload: UnlockPayload;
}

export interface RazorpayOrderResponse {
  ok: true;
  orderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
  productLabel: string;
}

export interface RazorpayVerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  product: UnlockProduct;
  email: string;
  payload: UnlockPayload;
}

export type RazorpayVerifyResponse =
  | {
      ok: true;
      product: "daily_vibe_unlock";
      detailed: DailyVibeDetailed;
      emailDelivered: boolean;
    }
  | {
      ok: true;
      product: "compatibility_unlock";
      detailed: CompatibilityDetailed;
      emailDelivered: boolean;
    }
  | { ok: false; error: string };

export type VedicEnvelope<T> =
  | { status: 200; response: T; remaining_api_calls?: number }
  | { status: 400; response: string; remaining_api_calls?: number };

// --- pricing (single source of truth) ---

export const PRICING = {
  daily_vibe_unlock: {
    amountInPaise: 1900,
    label: "Today, Fully Unlocked",
    blurb:
      "every segment of today's chart, expanded — love, work, money, body, mind. plus your lucky window, avoid window, and a mantra you can actually use.",
    cta: "unlock today for ₹19",
  },
  compatibility_unlock: {
    amountInPaise: 9900,
    label: "Full Compatibility, Unlocked",
    blurb:
      "all 8 koots, broken down. mangal + nadi check. how you two fight, how to repair, marriage timing window — the whole read.",
    cta: "unlock the full read for ₹99",
  },
} as const;
