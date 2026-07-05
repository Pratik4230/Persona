import type { UIMessage } from "ai";

import type { PersonaId } from "@/lib/personas";

export interface SessionMeta {
  id: string;
  personaId: PersonaId;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatSession extends SessionMeta {
  messages: UIMessage[];
}

/** Extract the plain text of a UI message from its parts. */
export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function countUserMessages(messages: UIMessage[]): number {
  return messages.filter((message) => message.role === "user").length;
}
