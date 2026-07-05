import type { UIMessage } from "ai";

import {
  COLLECTIONS,
  type ChatSessionDocument,
  type DailyUsageDocument,
} from "@/lib/db/collections";
import { ensureDbIndexes, getDb } from "@/lib/db/client";
import {
  countUserMessages,
  getMessageText,
  type ChatSession,
  type SessionMeta,
} from "@/lib/chat/types";
import {
  DAILY_MESSAGE_LIMIT,
  MAX_TOTAL_MESSAGES_PER_SESSION,
  MAX_USER_MESSAGES_PER_SESSION,
} from "@/lib/limits";
import { DEFAULT_PERSONA_ID, type PersonaId } from "@/lib/personas";

export type { ChatSession, SessionMeta } from "@/lib/chat/types";
export { getMessageText } from "@/lib/chat/types";

const DEFAULT_TITLE = "New chat";

function utcDay(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function deriveTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((message) => message.role === "user");
  const text = firstUser ? getMessageText(firstUser).trim() : "";
  if (!text) {
    return DEFAULT_TITLE;
  }
  return text.length > 48 ? `${text.slice(0, 48).trimEnd()}…` : text;
}

function toMeta(doc: ChatSessionDocument): SessionMeta {
  return {
    id: doc.id,
    personaId: doc.personaId,
    title: doc.title,
    createdAt: doc.createdAt.getTime(),
    updatedAt: doc.updatedAt.getTime(),
  };
}

function toSession(doc: ChatSessionDocument): ChatSession {
  return { ...toMeta(doc), messages: doc.messages };
}

async function sessionsCollection() {
  await ensureDbIndexes();
  return getDb().collection<ChatSessionDocument>(COLLECTIONS.chatSessions);
}

async function usageCollection() {
  await ensureDbIndexes();
  return getDb().collection<DailyUsageDocument>(COLLECTIONS.dailyUsage);
}

export async function listSessions(userId: string): Promise<SessionMeta[]> {
  const docs = await (await sessionsCollection())
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();
  return docs.map(toMeta);
}

export async function getSession(
  userId: string,
  sessionId: string,
): Promise<ChatSession | null> {
  const doc = await (await sessionsCollection()).findOne({ userId, id: sessionId });
  return doc ? toSession(doc) : null;
}

export async function createSession(
  userId: string,
  personaId: PersonaId = DEFAULT_PERSONA_ID,
  title: string = DEFAULT_TITLE,
): Promise<ChatSession> {
  const now = new Date();
  const doc: ChatSessionDocument = {
    id: crypto.randomUUID(),
    userId,
    personaId,
    title,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
  await (await sessionsCollection()).insertOne(doc);
  return toSession(doc);
}

export async function saveSessionMessages(
  userId: string,
  sessionId: string,
  messages: UIMessage[],
): Promise<ChatSession | null> {
  const collection = await sessionsCollection();
  const existing = await collection.findOne({ userId, id: sessionId });
  if (!existing) {
    return null;
  }

  const title =
    existing.title === DEFAULT_TITLE ? deriveTitle(messages) : existing.title;

  const result = await collection.findOneAndUpdate(
    { userId, id: sessionId },
    {
      $set: {
        messages,
        title,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  return result ? toSession(result) : null;
}

export async function renameSession(
  userId: string,
  sessionId: string,
  title: string,
): Promise<boolean> {
  const trimmed = title.trim() || DEFAULT_TITLE;
  const result = await (await sessionsCollection()).updateOne(
    { userId, id: sessionId },
    { $set: { title: trimmed, updatedAt: new Date() } },
  );
  return result.matchedCount > 0;
}

export async function deleteSession(
  userId: string,
  sessionId: string,
): Promise<boolean> {
  const result = await (await sessionsCollection()).deleteOne({
    userId,
    id: sessionId,
  });
  return result.deletedCount > 0;
}

export interface UsageState {
  count: number;
  remaining: number;
  limit: number;
}

function toUsageState(count: number): UsageState {
  return {
    count,
    remaining: Math.max(0, DAILY_MESSAGE_LIMIT - count),
    limit: DAILY_MESSAGE_LIMIT,
  };
}

export async function getUsageToday(userId: string): Promise<UsageState> {
  const day = utcDay();
  const doc = await (await usageCollection()).findOne({ userId, day });
  return toUsageState(doc?.count ?? 0);
}

export interface RateResult extends UsageState {
  allowed: boolean;
}

/** Consumes one daily message for the user. Does not consume when over limit. */
export async function consumeDailyQuota(userId: string): Promise<RateResult> {
  const day = utcDay();
  const collection = await usageCollection();
  const existing = await collection.findOne({ userId, day });
  const count = existing?.count ?? 0;

  if (count >= DAILY_MESSAGE_LIMIT) {
    return { ...toUsageState(count), allowed: false };
  }

  const next = count + 1;
  await collection.updateOne(
    { userId, day },
    { $set: { userId, day, count: next } },
    { upsert: true },
  );

  return { ...toUsageState(next), allowed: true };
}

export interface ConversationLimitResult {
  allowed: boolean;
  userMessageCount: number;
  totalMessageCount: number;
  reason?: string;
}

/** Check whether another user message is allowed in this conversation. */
export function checkConversationLimits(
  messages: UIMessage[],
): ConversationLimitResult {
  const userMessageCount = countUserMessages(messages);
  const totalMessageCount = messages.length;

  if (userMessageCount >= MAX_USER_MESSAGES_PER_SESSION) {
    return {
      allowed: false,
      userMessageCount,
      totalMessageCount,
      reason: `This chat has reached the limit of ${MAX_USER_MESSAGES_PER_SESSION} messages from you. Start a new chat to continue.`,
    };
  }

  if (totalMessageCount >= MAX_TOTAL_MESSAGES_PER_SESSION) {
    return {
      allowed: false,
      userMessageCount,
      totalMessageCount,
      reason: `This chat has reached the maximum of ${MAX_TOTAL_MESSAGES_PER_SESSION} messages. Start a new chat to continue.`,
    };
  }

  return { allowed: true, userMessageCount, totalMessageCount };
}

export interface MigrateSessionInput {
  id?: string;
  personaId: PersonaId;
  title: string;
  messages: UIMessage[];
  createdAt?: number;
  updatedAt?: number;
}

/** Bulk-import sessions (e.g. from localStorage after sign-in). */
export async function migrateSessions(
  userId: string,
  sessions: MigrateSessionInput[],
): Promise<number> {
  if (sessions.length === 0) {
    return 0;
  }

  const collection = await sessionsCollection();
  const now = new Date();
  let imported = 0;

  for (const session of sessions) {
    const id = session.id ?? crypto.randomUUID();
    const exists = await collection.findOne({ userId, id });
    if (exists) {
      continue;
    }

    const messages = session.messages.slice(-MAX_TOTAL_MESSAGES_PER_SESSION);
    const doc: ChatSessionDocument = {
      id,
      userId,
      personaId: session.personaId,
      title: session.title.trim() || DEFAULT_TITLE,
      messages,
      createdAt: session.createdAt ? new Date(session.createdAt) : now,
      updatedAt: session.updatedAt ? new Date(session.updatedAt) : now,
    };

    await collection.insertOne(doc);
    imported += 1;
  }

  return imported;
}
