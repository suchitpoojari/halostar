import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;
function anthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  client = new Anthropic({ apiKey });
  return client;
}

export const MODELS = {
  /** voice-rewrite default — fast, cheap, nails halostar voice at scale */
  voice: "claude-sonnet-4-6",
  /** long-form PDF generation — premium voice + structure */
  pdf: "claude-opus-4-7",
} as const;

interface CallOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** if true, mark the system prompt as cacheable (5-min TTL) */
  cacheSystem?: boolean;
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  opts: CallOptions = {}
): Promise<string> {
  const res = await anthropic().messages.create({
    model: opts.model ?? MODELS.voice,
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0.9,
    system: opts.cacheSystem
      ? [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }]
      : systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = res.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("no text content in claude response");
  }
  return textBlock.text;
}

/**
 * Calls Claude expecting a strict JSON object response and parses it.
 * Strips ```json fences if model emits them, retries the parse once.
 */
export async function generateJson<T>(
  systemPrompt: string,
  userPrompt: string,
  opts: CallOptions = {}
): Promise<T> {
  const text = await generateText(systemPrompt, userPrompt, {
    ...opts,
    temperature: opts.temperature ?? 0.85,
    maxTokens: opts.maxTokens ?? 1024,
  });

  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    // some models occasionally prepend a leading sentence before the JSON.
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
    }
    throw new Error(`claude returned non-JSON: ${(e as Error).message}\n--- raw ---\n${text.slice(0, 400)}`);
  }
}
