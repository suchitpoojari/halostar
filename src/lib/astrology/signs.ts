import type { ZodiacSign, ZodiacSignInfo } from '@/types/astrology';

export const ZODIAC_SIGNS: Record<ZodiacSign, ZodiacSignInfo> = {
  aries: {
    name: 'aries',
    symbol: '\u2648',
    emoji: '\u2648\uFE0F',
    element: 'fire',
    modality: 'cardinal',
    rulingPlanet: 'Mars',
    dateRange: 'Mar 21 - Apr 19',
    traits: ['bold', 'ambitious', 'impulsive', 'competitive'],
  },
  taurus: {
    name: 'taurus',
    symbol: '\u2649',
    emoji: '\u2649\uFE0F',
    element: 'earth',
    modality: 'fixed',
    rulingPlanet: 'Venus',
    dateRange: 'Apr 20 - May 20',
    traits: ['reliable', 'stubborn', 'sensual', 'patient'],
  },
  gemini: {
    name: 'gemini',
    symbol: '\u264A',
    emoji: '\u264A\uFE0F',
    element: 'air',
    modality: 'mutable',
    rulingPlanet: 'Mercury',
    dateRange: 'May 21 - Jun 20',
    traits: ['adaptable', 'curious', 'two-faced', 'witty'],
  },
  cancer: {
    name: 'cancer',
    symbol: '\u264B',
    emoji: '\u264B\uFE0F',
    element: 'water',
    modality: 'cardinal',
    rulingPlanet: 'Moon',
    dateRange: 'Jun 21 - Jul 22',
    traits: ['nurturing', 'moody', 'protective', 'intuitive'],
  },
  leo: {
    name: 'leo',
    symbol: '\u264C',
    emoji: '\u264C\uFE0F',
    element: 'fire',
    modality: 'fixed',
    rulingPlanet: 'Sun',
    dateRange: 'Jul 23 - Aug 22',
    traits: ['confident', 'dramatic', 'generous', 'attention-seeking'],
  },
  virgo: {
    name: 'virgo',
    symbol: '\u264D',
    emoji: '\u264D\uFE0F',
    element: 'earth',
    modality: 'mutable',
    rulingPlanet: 'Mercury',
    dateRange: 'Aug 23 - Sep 22',
    traits: ['analytical', 'perfectionist', 'helpful', 'overthinking'],
  },
  libra: {
    name: 'libra',
    symbol: '\u264E',
    emoji: '\u264E\uFE0F',
    element: 'air',
    modality: 'cardinal',
    rulingPlanet: 'Venus',
    dateRange: 'Sep 23 - Oct 22',
    traits: ['diplomatic', 'indecisive', 'charming', 'people-pleasing'],
  },
  scorpio: {
    name: 'scorpio',
    symbol: '\u264F',
    emoji: '\u264F\uFE0F',
    element: 'water',
    modality: 'fixed',
    rulingPlanet: 'Pluto',
    dateRange: 'Oct 23 - Nov 21',
    traits: ['intense', 'secretive', 'passionate', 'resourceful'],
  },
  sagittarius: {
    name: 'sagittarius',
    symbol: '\u2650',
    emoji: '\u2650\uFE0F',
    element: 'fire',
    modality: 'mutable',
    rulingPlanet: 'Jupiter',
    dateRange: 'Nov 22 - Dec 21',
    traits: ['adventurous', 'blunt', 'optimistic', 'commitment-phobic'],
  },
  capricorn: {
    name: 'capricorn',
    symbol: '\u2651',
    emoji: '\u2651\uFE0F',
    element: 'earth',
    modality: 'cardinal',
    rulingPlanet: 'Saturn',
    dateRange: 'Dec 22 - Jan 19',
    traits: ['disciplined', 'workaholic', 'ambitious', 'pragmatic'],
  },
  aquarius: {
    name: 'aquarius',
    symbol: '\u2652',
    emoji: '\u2652\uFE0F',
    element: 'air',
    modality: 'fixed',
    rulingPlanet: 'Uranus',
    dateRange: 'Jan 20 - Feb 18',
    traits: ['innovative', 'detached', 'humanitarian', 'rebellious'],
  },
  pisces: {
    name: 'pisces',
    symbol: '\u2653',
    emoji: '\u2653\uFE0F',
    element: 'water',
    modality: 'mutable',
    rulingPlanet: 'Neptune',
    dateRange: 'Feb 19 - Mar 20',
    traits: ['empathetic', 'escapist', 'creative', 'dreamy'],
  },
};

/**
 * Determine zodiac sign from a birth month and day.
 * Uses standard Western tropical astrology date boundaries.
 */
export function getSignByDate(month: number, day: number): ZodiacSign {
  // month is 1-indexed (1 = January, 12 = December)
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  // Pisces: Feb 19 - Mar 20
  return 'pisces';
}

/**
 * Retrieve full ZodiacSignInfo for a given sign.
 */
export function getSignInfo(sign: ZodiacSign): ZodiacSignInfo {
  return ZODIAC_SIGNS[sign];
}
