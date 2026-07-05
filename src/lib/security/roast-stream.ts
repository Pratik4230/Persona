import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessageStreamWriter,
} from "ai";

/** Write a pre-written roast into an active UI message stream. */
export function writeRoastToStream(
  writer: UIMessageStreamWriter,
  text: string,
  id = "roast",
): void {
  writer.write({ type: "text-start", id });

  for (const word of text.split(/\s+/)) {
    writer.write({ type: "text-delta", id, delta: `${word} ` });
  }

  writer.write({ type: "text-end", id });
}

/** Stream a pre-written roast with zero model tokens (same SSE shape as real chat). */
export function createRoastStreamResponse(
  text: string,
  headers?: Record<string, string>,
): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "start-step" });
      writeRoastToStream(writer, text);
      writer.write({ type: "finish-step" });
      writer.write({ type: "finish", finishReason: "stop" });
    },
  });

  return createUIMessageStreamResponse({ stream, headers });
}
