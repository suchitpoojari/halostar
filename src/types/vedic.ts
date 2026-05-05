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
  /** human-readable display name from Nominatim */
  display_name: string;
  /** short label suitable for UI, e.g. "Mumbai, Maharashtra, India" */
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
  /** end-of-dasha dates (per developer_note) */
  mahadasha_order: string[];
  start_year: number;
  dasha_start_date: string;
  dasha_remaining_at_birth: string;
}

export interface CurrentDasha {
  planet: string;
  /** ISO date when this maha-dasha started */
  startDate: string;
  /** ISO date when this maha-dasha ends */
  endDate: string;
  /** remaining time human-readable e.g. "3 years 4 months" */
  remaining: string;
}

// --- birth chart ---

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
  factors: Record<string, string>;
  is_present: boolean;
  is_dosha_present?: boolean;
  bot_response?: string;
  description?: string;
}

// --- ashtakoot matching ---

export interface AshtakootKoot {
  name: string;
  description: string;
  full_score: number;
  /** numeric score earned */
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

// --- daily vibe (halostar internal shape, returned from /api/vibe-check) ---

export interface DailyVibe {
  /** the one-line vibe for today */
  oneLiner: string;
  /** the 3 micro-predictions */
  career: string;
  love: string;
  money: string;
  /** raw vedic reference shown alongside */
  reference: {
    nakshatra: string;
    nakshatraLord: string;
    tithi: string;
    moonSign: string;
    currentDasha: string;
  };
  /** ISO date for which this vibe was generated */
  forDate: string;
}

// --- vibe-check API request body ---

export interface VibeCheckRequest {
  dob: string;
  tob: string;
  lat: number;
  lon: number;
  tz: number;
  place: string;
}

// --- raw vedicastroapi envelope ---

export type VedicEnvelope<T> =
  | { status: 200; response: T; remaining_api_calls?: number }
  | { status: 400; response: string; remaining_api_calls?: number };
