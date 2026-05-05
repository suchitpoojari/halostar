import { BASE_SYSTEM_PROMPT } from './base-system';
import type { ChartData, ZodiacSign } from '@/types/astrology';

export function buildVibeCheckPrompt(params: {
  sign: ZodiacSign;
  chartData?: ChartData;
  date: string;
}) {
  const systemPrompt = BASE_SYSTEM_PROMPT + `\n\nVIBE CHECK MODE: Generate today's cosmic vibe based on the current planetary energy. Think mood board meets horoscope. Be specific and creative.

Return ONLY valid JSON:
{
  "mood": "one word or short phrase for today's mood",
  "energy": "description of today's energy in 1-2 sentences",
  "luckyColor": "a specific color name (not generic)",
  "songRecommendation": "a real song title by a real artist that matches today's vibe",
  "cosmicAdvice": "one sentence of cosmic wisdom in Gen Z speak"
}`;

  const userPrompt = params.chartData
    ? `vibe check for ${params.date}. chart: sun ${params.chartData.sun.sign}, moon ${params.chartData.moon.sign}, rising ${params.chartData.rising.sign}. what's the cosmic energy serving today?`
    : `vibe check for a ${params.sign} on ${params.date}. what's the universe cooking?`;

  return { system: systemPrompt, user: userPrompt };
}
