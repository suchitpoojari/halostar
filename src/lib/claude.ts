import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_TEMPERATURE = 0.9;
const DEFAULT_MAX_TOKENS = 1024;

export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  },
): Promise<string> {
  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
    temperature: options?.temperature ?? DEFAULT_TEMPERATURE,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');

  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Claude response');
  }

  return textBlock.text;
}
