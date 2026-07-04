import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { MAX_MESSAGE_CHARS } from "@/lib/limits";
import { getPersona } from "@/lib/personas";
import { clientKeyFromHeaders, consumeDailyQuota } from "@/lib/rate-limit";

// Allow streaming responses up to 30 seconds.
export const maxDuration = 30;

/** Latest fast OpenAI model. Optionally overridable via CHAT_MODEL env. */
const MODEL = process.env.CHAT_MODEL ?? "gpt-5.4-nano";

/**
 * Context-window management: only the most recent messages are sent to the
 * model. This bounds token cost and latency while preserving enough history
 * for coherent, context-aware replies. See docs/DOCUMENTATION.md (section 3).
 */
const MAX_HISTORY_MESSAGES = 24;

interface ChatRequestBody {
  messages: UIMessage[];
  persona?: string;
}

export async function POST(req: Request) {
  let body: ChatRequestBody;

  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages, persona: personaId } = body;

  if (!Array.isArray(messages)) {
    return Response.json(
      { error: "`messages` must be an array." },
      { status: 400 },
    );
  }

  // Guard per-request token cost: reject a single oversized user message.
  const latest = messages.at(-1);
  const latestText =
    latest?.parts
      ?.map((part) => (part.type === "text" ? part.text : ""))
      .join("") ?? "";
  if (latestText.length > MAX_MESSAGE_CHARS) {
    return Response.json(
      {
        error: `Message is too long (max ${MAX_MESSAGE_CHARS} characters). Please shorten it.`,
      },
      { status: 413 },
    );
  }

  // Authoritative daily limit. Runs BEFORE the model call, so blocked requests
  // spend zero tokens. See src/lib/rate-limit.ts for the no-DB trade-offs.
  const { allowed, remaining, limit } = consumeDailyQuota(
    clientKeyFromHeaders(req.headers),
  );
  if (!allowed) {
    return Response.json(
      {
        error: `Daily limit reached. You can send ${limit} messages per day, please come back tomorrow.`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const persona = getPersona(personaId);
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);

  const result = streamText({
    model: openai(MODEL),
    instructions: persona.systemPrompt,
    messages: await convertToModelMessages(recentMessages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error("[/api/chat] stream error:", error);
        if (error instanceof Error) {
          return error.message;
        }
        return "Something went wrong while generating a response.";
      },
    }),
    headers: {
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
    },
  });
}
