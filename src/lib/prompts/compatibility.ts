import { BASE_SYSTEM_PROMPT } from './base-system';
import type { ChartData } from '@/types/astrology';

export function buildCompatibilityPrompt(params: {
  userChart: Partial<ChartData>;
  partnerChart: Partial<ChartData>;
}) {
  const systemPrompt = BASE_SYSTEM_PROMPT + `\n\nCOMPATIBILITY MODE: Analyze the synastry between two charts. Be real about challenges but ultimately constructive. Use the "situationship to soulmate" energy spectrum.

Return ONLY valid JSON:
{
  "overallScore": <1-100>,
  "vibeCheck": "one-liner summary of the dynamic",
  "sections": [
    { "name": "emotional", "score": <1-100>, "analysis": "2-3 sentences" },
    { "name": "communication", "score": <1-100>, "analysis": "2-3 sentences" },
    { "name": "physical", "score": <1-100>, "analysis": "2-3 sentences" },
    { "name": "longTerm", "score": <1-100>, "analysis": "2-3 sentences" },
    { "name": "chaosLevel", "score": <1-100>, "analysis": "2-3 sentences" }
  ],
  "verdict": "final 2-sentence take on this dynamic"
}`;

  const userPrompt = `analyze the compatibility between these two charts:\n\nperson 1: sun ${params.userChart.sun?.sign}, moon ${params.userChart.moon?.sign}, rising ${params.userChart.rising?.sign}, venus ${params.userChart.venus?.sign}, mars ${params.userChart.mars?.sign}\n\nperson 2: sun ${params.partnerChart.sun?.sign}, moon ${params.partnerChart.moon?.sign}, rising ${params.partnerChart.rising?.sign}, venus ${params.partnerChart.venus?.sign}, mars ${params.partnerChart.mars?.sign}\n\nbe brutally honest about the dynamic. we want the REAL tea.`;

  return { system: systemPrompt, user: userPrompt };
}
