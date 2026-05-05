import type { GeoPlace } from "@/types/vedic";

const NOMINATIM = "https://nominatim.openstreetmap.org";

/**
 * Place autocomplete using OpenStreetMap Nominatim.
 * Free, no auth. Rate limit: 1 req/sec — fine since this is called server-side
 * and only on user form interactions.
 *
 * Attribution required by Nominatim ToS — surfaced in the UI footer.
 */
export async function searchPlaces(q: string, limit: number = 6): Promise<GeoPlace[]> {
  const query = q.trim();
  if (query.length < 2) return [];

  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  const res = await fetch(url, {
    headers: {
      "User-Agent": "halostar/0.1 (+https://halostar.in)",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error(`nominatim ${res.status}`);

  const raw = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
    address?: {
      city?: string;
      town?: string;
      village?: string;
      state?: string;
      country?: string;
      country_code?: string;
    };
  }>;

  return raw.map((r) => {
    const a = r.address ?? {};
    const city = a.city ?? a.town ?? a.village ?? "";
    const label = [city, a.state, a.country].filter(Boolean).join(", ") || r.display_name;
    return {
      display_name: r.display_name,
      label,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    };
  });
}

/**
 * Common timezones for the birth-data form. India default (most halostar users).
 * Decimal hours = format vedicastroapi expects.
 */
export const TIMEZONE_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "India / Sri Lanka (+5:30)", value: 5.5 },
  { label: "Pakistan / Maldives (+5:00)", value: 5.0 },
  { label: "Nepal (+5:45)", value: 5.75 },
  { label: "Bangladesh / Bhutan (+6:00)", value: 6.0 },
  { label: "Gulf — UAE / Oman (+4:00)", value: 4.0 },
  { label: "Gulf — Saudi / Bahrain / Qatar (+3:00)", value: 3.0 },
  { label: "UK / Ireland (+0:00)", value: 0.0 },
  { label: "Central Europe (+1:00)", value: 1.0 },
  { label: "Eastern US (-5:00)", value: -5.0 },
  { label: "Pacific US (-8:00)", value: -8.0 },
  { label: "Singapore / Malaysia (+8:00)", value: 8.0 },
  { label: "Japan / Korea (+9:00)", value: 9.0 },
  { label: "Australia East (+10:00)", value: 10.0 },
];
