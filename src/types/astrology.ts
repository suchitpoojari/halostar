export type ZodiacSign = 'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' | 'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';

export interface ZodiacSignInfo {
  name: ZodiacSign;
  symbol: string;  // unicode symbol
  emoji: string;
  element: Element;
  modality: Modality;
  rulingPlanet: string;
  dateRange: string;  // e.g. "Mar 21 - Apr 19"
  traits: string[];
}

export interface BirthData {
  birthDate: string;  // ISO date
  birthTime: string | null;  // HH:mm or null if unknown
  birthTimeKnown: boolean;
  latitude: number;
  longitude: number;
  locationName: string;
  timezone: string;
}

export interface ChartData {
  sun: { sign: ZodiacSign; degree: number; house: number };
  moon: { sign: ZodiacSign; degree: number; house: number };
  rising: { sign: ZodiacSign; degree: number };
  mercury: { sign: ZodiacSign; degree: number; house: number; retrograde: boolean };
  venus: { sign: ZodiacSign; degree: number; house: number; retrograde: boolean };
  mars: { sign: ZodiacSign; degree: number; house: number; retrograde: boolean };
  jupiter: { sign: ZodiacSign; degree: number; house: number; retrograde: boolean };
  saturn: { sign: ZodiacSign; degree: number; house: number; retrograde: boolean };
  uranus: { sign: ZodiacSign; degree: number; house: number; retrograde: boolean };
  neptune: { sign: ZodiacSign; degree: number; house: number; retrograde: boolean };
  pluto: { sign: ZodiacSign; degree: number; house: number; retrograde: boolean };
  houses: HouseData[];
  aspects: AspectData[];
}

export interface HouseData {
  number: number;
  sign: ZodiacSign;
  degree: number;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  degree: number;
  orb: number;
}

export interface Placement {
  planet: string;
  sign: ZodiacSign;
  degree: number;
  house: number;
  retrograde?: boolean;
}

export interface DailyReading {
  headline: string;
  body: string;
  advice: string;
  luckyNumber: number;
}

export interface CompatibilityReport {
  overallScore: number;
  vibeCheck: string;
  sections: {
    name: string;
    score: number;
    analysis: string;
  }[];
  verdict: string;
}

export interface VibeCheck {
  mood: string;
  energy: string;
  luckyColor: string;
  songRecommendation: string;
  cosmicAdvice: string;
}
