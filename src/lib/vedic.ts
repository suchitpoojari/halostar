import type {
  AshtakootKoot,
  AshtakootResult,
  BirthData,
  CurrentDasha,
  MahaDasha,
  MangalDosha,
  MoonSign,
  Panchang,
  PlanetPosition,
  VedicEnvelope,
} from "@/types/vedic";

const BASE = "https://api.vedicastroapi.com/v3-json";

function key(): string {
  const k = process.env.VEDIC_ASTRO_API_KEY;
  if (!k) throw new Error("VEDIC_ASTRO_API_KEY is not set");
  return k;
}

async function get<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) search.set(k, String(v));
  search.set("api_key", key());
  const url = `${BASE}${path}?${search.toString()}`;

  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`vedic api ${res.status} on ${path}`);
  }

  const data = (await res.json()) as VedicEnvelope<T>;
  if (data.status !== 200) {
    throw new Error(`vedic api error on ${path}: ${data.response}`);
  }
  return data.response;
}

function ddmmyyyy(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

// ---------- panchang ----------

export async function getPanchang(forDate: Date, lat: number, lon: number, tz: number): Promise<Panchang> {
  return get<Panchang>("/panchang/panchang", {
    date: ddmmyyyy(forDate),
    tz,
    lat,
    lon,
  });
}

// ---------- moon sign ----------

export async function getMoonSign(b: BirthData): Promise<MoonSign> {
  return get<MoonSign>("/extended-horoscope/find-moon-sign", {
    dob: b.dob,
    tob: b.tob,
    lat: b.lat,
    lon: b.lon,
    tz: b.tz,
  });
}

// ---------- birth chart planets ----------

export async function getPlanets(b: BirthData): Promise<PlanetPosition[]> {
  const raw = await get<Record<string, PlanetPosition>>("/horoscope/planet-details", {
    dob: b.dob,
    tob: b.tob,
    lat: b.lat,
    lon: b.lon,
    tz: b.tz,
  });
  return Object.values(raw);
}

// ---------- vimshottari dasha ----------

export async function getMahaDasha(b: BirthData): Promise<MahaDasha> {
  return get<MahaDasha>("/dashas/maha-dasha", {
    dob: b.dob,
    tob: b.tob,
    lat: b.lat,
    lon: b.lon,
    tz: b.tz,
  });
}

/**
 * compute current mahadasha from the full sequence.
 * mahadasha_order contains END dates per dasha (developer note from API).
 * dasha_start_date is when the FIRST dasha began.
 */
export function computeCurrentDasha(md: MahaDasha, now: Date = new Date()): CurrentDasha {
  const ends = md.mahadasha_order.map((s) => new Date(s));
  const t = now.getTime();
  let idx = ends.findIndex((d) => d.getTime() > t);
  if (idx === -1) idx = ends.length - 1;

  const start = idx === 0 ? new Date(md.dasha_start_date) : ends[idx - 1];
  const end = ends[idx];
  const planet = md.mahadasha[idx];

  const remainingMs = end.getTime() - t;
  const days = Math.max(0, Math.floor(remainingMs / 86_400_000));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remaining =
    years > 0
      ? `${years} year${years > 1 ? "s" : ""}${months > 0 ? ` ${months} month${months > 1 ? "s" : ""}` : ""}`
      : `${months} month${months !== 1 ? "s" : ""}`;

  return {
    planet,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    remaining,
  };
}

// ---------- mangal dosha ----------

export async function getMangalDosha(b: BirthData): Promise<MangalDosha> {
  return get<MangalDosha>("/dosha/mangal-dosh", {
    dob: b.dob,
    tob: b.tob,
    lat: b.lat,
    lon: b.lon,
    tz: b.tz,
  });
}

// ---------- ashtakoot matching ----------

interface RawAshtakootResponse {
  tara: { boy_tara: string; girl_tara: string; tara: number; description: string; name: string; full_score: number };
  gana: { boy_gana: string; girl_gana: string; gana: number; description: string; name: string; full_score: number };
  yoni: { boy_yoni: string; girl_yoni: string; yoni: number; description: string; name: string; full_score: number };
  bhakoot: {
    boy_rasi: number;
    girl_rasi: number;
    boy_rasi_name: string;
    girl_rasi_name: string;
    bhakoot: number;
    description: string;
    name: string;
    full_score: number;
  };
  grahamaitri: {
    boy_lord: string;
    girl_lord: string;
    grahamaitri: number;
    description: string;
    name: string;
    full_score: number;
  };
  vasya: { boy_vasya: string; girl_vasya: string; vasya: number; description: string; name: string; full_score: number };
  nadi: { boy_nadi: string; girl_nadi: string; nadi: number; description: string; name: string; full_score: number };
  varna: { boy_varna: string; girl_varna: string; varna: number; description: string; name: string; full_score: number };
  score: number;
  bot_response: string;
}

function asKoot<K extends keyof RawAshtakootResponse>(
  raw: RawAshtakootResponse,
  key: K,
  scoreField: keyof RawAshtakootResponse[K]
): AshtakootKoot {
  const k = raw[key] as RawAshtakootResponse[K] & { description: string; full_score: number };
  const score = (k as Record<string, unknown>)[scoreField as string] as number;
  const { description, full_score, ...rest } = k as Record<string, unknown> & {
    description: string;
    full_score: number;
  };
  return {
    name: String(key),
    description,
    full_score,
    score,
    details: rest as Record<string, string | number>,
  };
}

export async function getAshtakoot(boy: BirthData, girl: BirthData): Promise<AshtakootResult> {
  const raw = await get<RawAshtakootResponse>("/matching/ashtakoot", {
    boy_dob: boy.dob,
    boy_tob: boy.tob,
    boy_lat: boy.lat,
    boy_lon: boy.lon,
    boy_tz: boy.tz,
    girl_dob: girl.dob,
    girl_tob: girl.tob,
    girl_lat: girl.lat,
    girl_lon: girl.lon,
    girl_tz: girl.tz,
  });

  return {
    total: raw.score,
    outOf: 36,
    bot_response: raw.bot_response,
    koots: {
      varna: asKoot(raw, "varna", "varna"),
      vasya: asKoot(raw, "vasya", "vasya"),
      tara: asKoot(raw, "tara", "tara"),
      yoni: asKoot(raw, "yoni", "yoni"),
      grahamaitri: asKoot(raw, "grahamaitri", "grahamaitri"),
      gana: asKoot(raw, "gana", "gana"),
      bhakoot: asKoot(raw, "bhakoot", "bhakoot"),
      nadi: asKoot(raw, "nadi", "nadi"),
    },
  };
}

// ---------- helper: ddmmyyyy export for callers ----------

export { ddmmyyyy };
