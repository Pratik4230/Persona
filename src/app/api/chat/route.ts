import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
  type UIMessageChunk,
} from "ai";

import { requireSession } from "@/lib/api/session";
import {
  checkConversationLimits,
  consumeDailyQuota,
  getSession,
} from "@/lib/chat/repository";
import { MAX_MESSAGE_CHARS } from "@/lib/limits";
import { getPersona } from "@/lib/personas";
import {
  getActiveCooldown,
  type MisuseReason,
} from "@/lib/security/cooldown-repository";
import { getCooldownMessage } from "@/lib/security/cooldown-messages";
import { getFirstStrikeRoast } from "@/lib/security/first-strike-messages";
import { MISUSE_GUARD_INSTRUCTIONS } from "@/lib/security/misuse-prompt";
import { createMisuseCooldownTool } from "@/lib/security/misuse-tool";
import {
  createRoastStreamResponse,
  writeRoastToStream,
} from "@/lib/security/roast-stream";

export const maxDuration = 30;

const MODEL = process.env.CHAT_MODEL ?? "gpt-5.4-nano";
const MAX_HISTORY_MESSAGES = 24;

interface ChatRequestBody {
  messages: UIMessage[];
  persona?: string;
  sessionId?: string;
}

function rateLimitHeaders(limit: number, remaining: number): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
  };
}

function cooldownHeaders(cooldownUntil: Date): Record<string, string> {
  return {
    "X-Cooldown-Active": "1",
    "X-Cooldown-Until": cooldownUntil.toISOString(),
  };
}

export async function POST(req: Request) {
  const authResult = await requireSession();
  if ("response" in authResult) {
    return authResult.response;
  }

  const userId = authResult.session.user.id;

  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages, persona: personaId, sessionId } = body;

  if (!Array.isArray(messages)) {
    return Response.json(
      { error: "`messages` must be an array." },
      { status: 400 },
    );
  }

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

  const persona = getPersona(personaId);

  const conversationCheck = checkConversationLimits(messages);
  if (!conversationCheck.allowed) {
    return Response.json({ error: conversationCheck.reason }, { status: 429 });
  }

  if (sessionId) {
    const stored = await getSession(userId, sessionId);
    if (stored) {
      const storedCheck = checkConversationLimits(stored.messages);
      if (!storedCheck.allowed) {
        return Response.json({ error: storedCheck.reason }, { status: 429 });
      }
    }
  }

  const { allowed, remaining, limit } = await consumeDailyQuota(userId);
  if (!allowed) {
    return Response.json(
      {
        error: `Daily limit reached. You can send ${limit} messages per day, please come back tomorrow.`,
      },
      {
        status: 429,
        headers: rateLimitHeaders(limit, 0),
      },
    );
  }

  const headers = rateLimitHeaders(limit, remaining);

  const cooldown = await getActiveCooldown(userId);
  if (cooldown) {
    const message = getCooldownMessage(persona.id, cooldown.cooldownUntil);
    return createRoastStreamResponse(message, {
      ...headers,
      ...cooldownHeaders(cooldown.cooldownUntil),
    });
  }

  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
  let misuseReason: MisuseReason | null = null;

  const result = streamText({
    model: openai(MODEL),
    instructions: `${MISUSE_GUARD_INSTRUCTIONS}\n\n${persona.systemPrompt}`,
    messages: await convertToModelMessages(recentMessages),
    tools: {
      applyMisuseCooldown: createMisuseCooldownTool(userId, {
        onApplied: (reason) => {
          misuseReason = reason;
        },
      }),
    },
    stopWhen: stepCountIs(4),
    onStepFinish: ({ toolCalls }) => {
      for (const toolCall of toolCalls) {
        if (toolCall.toolName !== "applyMisuseCooldown") {
          continue;
        }

        const input = toolCall.input as { reason?: MisuseReason };
        if (input.reason) {
          misuseReason = input.reason;
        }
      }
    },
  });

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const uiStream = toUIMessageStream({
        stream: result.stream,
        onError: (error) => {
          console.error("[/api/chat] stream error:", error);
          if (error instanceof Error) {
            return error.message;
          }
          return "Something went wrong while generating a response.";
        },
      });

      const reader = uiStream.getReader();
      let pastFirstStep = false;
      let stepBuffer: UIMessageChunk[] = [];

      try {
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) {
            break;
          }

          if (!pastFirstStep) {
            stepBuffer.push(chunk);

            if (chunk.type !== "finish-step") {
              continue;
            }

            pastFirstStep = true;

            if (misuseReason) {
              for (const buffered of stepBuffer) {
                if (buffered.type === "start" || buffered.type === "start-step") {
                  writer.write(buffered);
                }
              }

              writeRoastToStream(
                writer,
                getFirstStrikeRoast(persona.id, misuseReason),
              );
              writer.write({ type: "finish-step" });
              stepBuffer = [];
              continue;
            }

            for (const buffered of stepBuffer) {
              writer.write(buffered);
            }
            stepBuffer = [];
            continue;
          }

          if (misuseReason) {
            if (chunk.type === "finish") {
              writer.write(chunk);
            }
            continue;
          }

          writer.write(chunk);
        }
      } finally {
        reader.releaseLock();
      }
    },
  });

  const activeCooldown = misuseReason
    ? await getActiveCooldown(userId)
    : null;

  return createUIMessageStreamResponse({
    stream,
    headers: {
      ...headers,
      ...(activeCooldown
        ? cooldownHeaders(activeCooldown.cooldownUntil)
        : {}),
    },
  });
}
