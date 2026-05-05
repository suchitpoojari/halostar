import { BASE_SYSTEM_PROMPT } from './base-system';
import type { ChartData, ZodiacSign } from '@/types/astrology';

export function buildDailyReadingPrompt(params: {
  sign: ZodiacSign;
  date: string;
  isPremium: boolean;
  chartData?: ChartData;
}) {
  const systemPrompt = BASE_SYSTEM_PROMPT + `\n\nYou are generating a daily horoscope reading. Return ONLY valid JSON with this exact structure:
{ "headline": "catchy 5-8 word hook in lowercase", "body": "main reading 100-150 words", "advice": "one actionable sentence", "luckyNumber": <number 1-99> }`;

  const userPrompt = params.isPremium && params.chartData
    ? `generate a personalized daily reading for ${params.date}.\nbirth chart: sun in ${params.chartData.sun.sign}, moon in ${params.chartData.moon.sign}, rising ${params.chartData.rising.sign}.\ngo deep on the placements and current transits.`
    : `generate a daily horoscope for ${params.sign} for ${params.date}. keep it general but punchy and relatable.`;

  return { system: systemPrompt, user: userPrompt };
}
