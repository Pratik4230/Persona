/**
 * Lightweight localStorage-backed store for chat sessions.
 *
 * We keep a small `index` (session metadata) separate from each session's full
 * message list, so listing sessions in the sidebar is cheap and loading a full
 * conversation only happens on demand. The TanStack Query hooks in
 * `src/hooks/use-chat-sessions.ts` wrap these functions with caching +
 * invalidation so every component stays in sync.
 */

import type { UIMessage } from "ai";

import { DAILY_MESSAGE_LIMIT } from "@/lib/limits";
import { DEFAULT_PERSONA_ID, type PersonaId } from "@/lib/personas";

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

const INDEX_KEY = "persona-ai:index";
const ACTIVE_KEY = "persona-ai:active";
const USAGE_KEY = "persona-ai:usage";
const sessionKey = (id: string) => `persona-ai:session:${id}`;

const DEFAULT_TITLE = "New chat";

function isBrowser(): boolean {
  return typeof window !== "undefined";
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

function readIndex(): SessionMeta[] {
  if (!isBrowser()) {
    return [];
  }
  return safeParse<SessionMeta[]>(localStorage.getItem(INDEX_KEY), []);
}

function writeIndex(metas: SessionMeta[]): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.setItem(INDEX_KEY, JSON.stringify(metas));
}

/** Extract the plain text of a UI message from its parts. */
export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/** Build a short session title from the first user message. */
export function deriveTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  const text = firstUser ? getMessageText(firstUser).trim() : "";
  if (!text) {
    return DEFAULT_TITLE;
  }
  return text.length > 48 ? `${text.slice(0, 48).trimEnd()}…` : text;
}

/** All session metadata, newest first. */
export function getSessionIndex(): SessionMeta[] {
  return readIndex().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getSession(id: string): ChatSession | null {
  if (!isBrowser()) {
    return null;
  }
  return safeParse<ChatSession | null>(localStorage.getItem(sessionKey(id)), null);
}

export function createSession(
  personaId: PersonaId = DEFAULT_PERSONA_ID,
  title: string = DEFAULT_TITLE,
): ChatSession {
  const now = Date.now();
  const session: ChatSession = {
    id:
      isBrowser() && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${now}_${Math.random().toString(36).slice(2, 8)}`,
    personaId,
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  if (isBrowser()) {
    localStorage.setItem(sessionKey(session.id), JSON.stringify(session));
    writeIndex([toMeta(session), ...readIndex()]);
  }
  return session;
}

function toMeta(session: ChatSession): SessionMeta {
  const { messages: _messages, ...meta } = session;
  return meta;
}

/** Persist a session's messages, refreshing its title + updatedAt. */
export function saveSessionMessages(id: string, messages: UIMessage[]): void {
  if (!isBrowser()) {
    return;
  }
  const existing = getSession(id);
  const now = Date.now();
  const base: ChatSession =
    existing ??
    ({
      id,
      personaId: DEFAULT_PERSONA_ID,
      title: DEFAULT_TITLE,
      createdAt: now,
      updatedAt: now,
      messages: [],
    } satisfies ChatSession);

  const title =
    base.title === DEFAULT_TITLE ? deriveTitle(messages) : base.title;

  const next: ChatSession = { ...base, messages, title, updatedAt: now };
  localStorage.setItem(sessionKey(id), JSON.stringify(next));

  const index = readIndex().filter((meta) => meta.id !== id);
  writeIndex([toMeta(next), ...index]);
}

export function renameSession(id: string, title: string): void {
  if (!isBrowser()) {
    return;
  }
  const trimmed = title.trim() || DEFAULT_TITLE;
  const session = getSession(id);
  if (session) {
    localStorage.setItem(
      sessionKey(id),
      JSON.stringify({ ...session, title: trimmed, updatedAt: Date.now() }),
    );
  }
  writeIndex(
    readIndex().map((meta) =>
      meta.id === id ? { ...meta, title: trimmed, updatedAt: Date.now() } : meta,
    ),
  );
}

export function deleteSession(id: string): void {
  if (!isBrowser()) {
    return;
  }
  localStorage.removeItem(sessionKey(id));
  writeIndex(readIndex().filter((meta) => meta.id !== id));
}

export function getActiveSessionId(): string | null {
  if (!isBrowser()) {
    return null;
  }
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveSessionId(id: string | null): void {
  if (!isBrowser()) {
    return;
  }
  if (id) {
    localStorage.setItem(ACTIVE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

/* -------------------------------------------------------------------------- */
/* Daily usage (client-side mirror of the server limit, for UX only)          */
/* -------------------------------------------------------------------------- */

interface DailyUsage {
  /** UTC day (YYYY-MM-DD). */
  day: string;
  count: number;
}

export interface UsageState {
  count: number;
  remaining: number;
  limit: number;
}

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

function toUsageState(count: number): UsageState {
  return {
    count,
    remaining: Math.max(0, DAILY_MESSAGE_LIMIT - count),
    limit: DAILY_MESSAGE_LIMIT,
  };
}

/**
 * Today's message usage. This is a UX convenience only, the real limit is
 * enforced server-side in `src/app/api/chat/route.ts`.
 */
export function getUsageToday(): UsageState {
  if (!isBrowser()) {
    return toUsageState(0);
  }
  const usage = safeParse<DailyUsage | null>(
    localStorage.getItem(USAGE_KEY),
    null,
  );
  const count = usage && usage.day === utcDay() ? usage.count : 0;
  return toUsageState(count);
}

/** Records one sent message against today's quota and returns the new state. */
export function consumeUsage(): UsageState {
  const current = getUsageToday();
  const next = current.count + 1;
  if (isBrowser()) {
    localStorage.setItem(
      USAGE_KEY,
      JSON.stringify({ day: utcDay(), count: next } satisfies DailyUsage),
    );
  }
  return toUsageState(next);
}
