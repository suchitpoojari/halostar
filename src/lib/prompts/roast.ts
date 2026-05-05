import { BASE_SYSTEM_PROMPT } from './base-system';
import type { ChartData, ZodiacSign } from '@/types/astrology';

export function buildRoastPrompt(params: {
  sign: ZodiacSign;
  fullChart?: ChartData;
}) {
  const systemPrompt = BASE_SYSTEM_PROMPT + `\n\nROAST MODE ACTIVATED. Maximum savage energy. Think "the most accurate personal attack disguised as astrology." The user WANTS to be roasted — don't hold back. End with one begrudging compliment.

Return ONLY valid JSON: { "roastText": "the full roast, 100-150 words", "savageLevel": <number 1-10> }`;

  const userPrompt = params.fullChart
    ? `roast this person HARD based on their full chart: sun ${params.fullChart.sun.sign}, moon ${params.fullChart.moon.sign}, rising ${params.fullChart.rising.sign}, venus ${params.fullChart.venus.sign}, mars ${params.fullChart.mars.sign}. be SPECIFIC about their placements. make it hurt (lovingly).`
    : `roast a ${params.sign}. make it devastating but funny. go for the jugular bestie.`;

  return { system: systemPrompt, user: userPrompt };
}
