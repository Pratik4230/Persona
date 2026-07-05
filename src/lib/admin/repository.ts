import type { UIMessage } from "ai";
import { ObjectId } from "mongodb";

import { COLLECTIONS } from "@/lib/db/collections";
import { getDb } from "@/lib/db/client";
import type {
  AdminSessionDetail,
  AdminSessionSummary,
  AdminUserSummary,
  PaginatedResult,
} from "@/lib/admin/types";
import { ADMIN_PAGE_SIZE, paginationMeta } from "@/lib/admin/types";
import type { PersonaId } from "@/lib/personas";

function serializeMessages(messages: UIMessage[]): UIMessage[] {
  return messages.map((message) => ({
    id: String(message.id),
    role: message.role,
    parts: message.parts
      .filter(
        (part): part is { type: "text"; text: string } => part.type === "text",
      )
      .map((part) => ({ type: "text" as const, text: part.text })),
  }));
}

const users = () => getDb().collection("user");
const sessions = () => getDb().collection(COLLECTIONS.chatSessions);

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function userFilter(userId: string) {
  if (!ObjectId.isValid(userId)) {
    return null;
  }
  return { _id: new ObjectId(userId) };
}

function userIdFromDoc(doc: { _id: unknown }): string {
  return doc._id instanceof ObjectId ? doc._id.toString() : String(doc._id);
}

async function chatCountsFor(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const rows = await sessions()
    .aggregate<{ _id: string; count: number }>([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ])
    .toArray();

  return new Map(rows.map((row) => [row._id, row.count]));
}

function toUser(
  doc: {
    _id: unknown;
    name: string;
    email: string;
    emailVerified?: boolean;
    createdAt: Date | string;
  },
  conversationCount: number,
): AdminUserSummary {
  return {
    id: userIdFromDoc(doc),
    name: doc.name,
    email: doc.email,
    emailVerified: Boolean(doc.emailVerified),
    createdAt: toIso(doc.createdAt),
    conversationCount,
  };
}

export async function listAdminUsers(
  page = 1,
  limit = ADMIN_PAGE_SIZE,
): Promise<PaginatedResult<AdminUserSummary>> {
  const skip = (page - 1) * limit;

  const [total, docs] = await Promise.all([
    users().countDocuments(),
    users()
      .find({}, { projection: { name: 1, email: 1, emailVerified: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  const ids = docs.map(userIdFromDoc);
  const counts = await chatCountsFor(ids);

  return {
    items: docs.map((doc) =>
      toUser(
        doc as {
          _id: unknown;
          name: string;
          email: string;
          emailVerified?: boolean;
          createdAt: Date | string;
        },
        counts.get(userIdFromDoc(doc)) ?? 0,
      ),
    ),
    pagination: paginationMeta(total, page, limit),
  };
}

export async function getAdminUser(
  userId: string,
): Promise<AdminUserSummary | null> {
  const filter = userFilter(userId);
  if (!filter) {
    return null;
  }

  const doc = (await users().findOne(filter, {
    projection: { name: 1, email: 1, emailVerified: 1, createdAt: 1 },
  })) as {
    _id: unknown;
    name: string;
    email: string;
    emailVerified?: boolean;
    createdAt: Date | string;
  } | null;

  if (!doc) {
    return null;
  }

  const conversationCount = await sessions().countDocuments({ userId });
  return toUser(doc, conversationCount);
}

export async function getAdminUserName(userId: string): Promise<string | null> {
  const filter = userFilter(userId);
  if (!filter) {
    return null;
  }

  const doc = await users().findOne(filter, {
    projection: { name: 1 },
  });
  return doc?.name ?? null;
}

export async function listAdminUserSessions(
  userId: string,
  page = 1,
  limit = ADMIN_PAGE_SIZE,
): Promise<PaginatedResult<AdminSessionSummary>> {
  const skip = (page - 1) * limit;

  const [total, docs] = await Promise.all([
    sessions().countDocuments({ userId }),
    sessions()
      .find(
        { userId },
        { projection: { id: 1, personaId: 1, title: 1, updatedAt: 1 } },
      )
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
  ]);

  return {
    items: docs.map((doc) => ({
      id: String(doc.id),
      personaId: doc.personaId as PersonaId,
      title: String(doc.title),
      updatedAt: toIso(doc.updatedAt),
    })),
    pagination: paginationMeta(total, page, limit),
  };
}

export async function getAdminSessionDetail(
  userId: string,
  sessionId: string,
): Promise<AdminSessionDetail | null> {
  const doc = await sessions().findOne(
    { userId, id: sessionId },
    { projection: { id: 1, personaId: 1, title: 1, updatedAt: 1, messages: 1 } },
  );

  if (!doc) {
    return null;
  }

  return {
    id: String(doc.id),
    personaId: doc.personaId as PersonaId,
    title: String(doc.title),
    updatedAt: toIso(doc.updatedAt),
    messages: serializeMessages((doc.messages ?? []) as UIMessage[]),
  };
}
