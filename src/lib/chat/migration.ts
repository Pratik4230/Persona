/**
 * Reads legacy localStorage chat data for one-time migration after sign-in.
 * Mirrors keys from the previous client-only store.
 */

import type { UIMessage } from "ai";

import type { MigrateSessionInput } from "@/lib/chat/repository";
import type { PersonaId } from "@/lib/personas";

const INDEX_KEY = "persona-ai:index";
const sessionKey = (id: string) => `persona-ai:session:${id}`;

interface LegacySessionMeta {
  id: string;
  personaId: PersonaId;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface LegacyChatSession extends LegacySessionMeta {
  messages: UIMessage[];
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Returns all local sessions if running in the browser; empty on server. */
export function readLegacyLocalSessions(): MigrateSessionInput[] {
  if (typeof window === "undefined") {
    return [];
  }

  const index = safeParse<LegacySessionMeta[]>(
    localStorage.getItem(INDEX_KEY),
    [],
  );

  const sessions: MigrateSessionInput[] = [];

  for (const meta of index) {
    const full = safeParse<LegacyChatSession | null>(
      localStorage.getItem(sessionKey(meta.id)),
      null,
    );
    if (!full || full.messages.length === 0) {
      continue;
    }
    sessions.push({
      id: full.id,
      personaId: full.personaId,
      title: full.title,
      messages: full.messages,
      createdAt: full.createdAt,
      updatedAt: full.updatedAt,
    });
  }

  return sessions;
}

const MIGRATED_KEY = "persona-ai:migrated";

export function hasMigratedLocally(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  return localStorage.getItem(MIGRATED_KEY) === "1";
}

export function markMigratedLocally(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(MIGRATED_KEY, "1");
  localStorage.removeItem(INDEX_KEY);
  localStorage.removeItem("persona-ai:active");
  localStorage.removeItem("persona-ai:usage");

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key?.startsWith("persona-ai:session:")) {
      keysToRemove.push(key);
    }
  }
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
  }
}
