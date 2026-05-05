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

// --- daily vibe (free) ---

export interface DailyVibe {
  oneLiner: string;
  career: string;
  love: string;
  money: string;
  reference: {
    nakshatra: string;
    nakshatraLord: string;
    tithi: string;
    moonSign: string;
    currentDasha: string;
  };
  forDate: string;
  /**
   * Optional: when present, the original birth data, so the unlock flow
   * can re-run the chart calc for the longer 90-day PDF without asking again.
   */
  birth?: BirthData;
}

export interface VibeCheckRequest {
  dob: string;
  tob: string;
  lat: number;
  lon: number;
  tz: number;
  place: string;
}

// --- compatibility (free) ---

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

export interface MatchRequest {
  boy: VibeCheckRequest;
  girl: VibeCheckRequest;
}

// --- razorpay ---

export interface RazorpayOrderRequest {
  /** product key on our end */
  product: "daily_vibe_unlock" | "compatibility_unlock";
  /** user's email for receipt + PDF delivery */
  email: string;
  /** the input payload that produced the free reading; we re-run for the PDF */
  payload:
    | { kind: "daily_vibe"; birth: VibeCheckRequest }
    | { kind: "compatibility"; boy: VibeCheckRequest; girl: VibeCheckRequest };
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
  product: "daily_vibe_unlock" | "compatibility_unlock";
  email: string;
  payload:
    | { kind: "daily_vibe"; birth: VibeCheckRequest }
    | { kind: "compatibility"; boy: VibeCheckRequest; girl: VibeCheckRequest };
}

export type VedicEnvelope<T> =
  | { status: 200; response: T; remaining_api_calls?: number }
  | { status: 400; response: string; remaining_api_calls?: number };

// --- pricing (single source of truth) ---

export const PRICING = {
  daily_vibe_unlock: {
    amountInPaise: 1900,
    label: "90-Day Dasha Reading",
    blurb: "the next 90 days, mapped — your current mahadasha, weekly tilts, what to ship, what to wait on. one PDF, lifetime yours.",
  },
  compatibility_unlock: {
    amountInPaise: 19900,
    label: "Full Compatibility Report",
    blurb: "all 8 koots broken down. mangal + nadi check. marriage timing window. fight-without-breakup decoder. one PDF.",
  },
} as const;
