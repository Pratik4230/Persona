import {
  COLLECTIONS,
  type UserCooldownDocument,
} from "@/lib/db/collections";
import { ensureDbIndexes, getDb } from "@/lib/db/client";
import { COOLDOWN_MS, STRIKE_RESET_MS } from "@/lib/security/constants";

export type MisuseReason =
  | "prompt_injection"
  | "token_farming"
  | "jailbreak"
  | "off_topic_spam"
  | "other";

export interface ActiveCooldown {
  cooldownUntil: Date;
  strikes: number;
  lastReason: MisuseReason | string;
}

async function cooldownCollection() {
  await ensureDbIndexes();
  return getDb().collection<UserCooldownDocument>(COLLECTIONS.userCooldowns);
}

/** Returns an active cooldown if the user is still in the penalty window. */
export async function getActiveCooldown(
  userId: string,
): Promise<ActiveCooldown | null> {
  const doc = await (await cooldownCollection()).findOne({ userId });
  if (!doc) {
    return null;
  }

  const now = new Date();
  if (doc.cooldownUntil <= now) {
    return null;
  }

  return {
    cooldownUntil: doc.cooldownUntil,
    strikes: doc.strikes,
    lastReason: doc.lastReason,
  };
}

/** Called by the model's misuse tool after it detects clear abuse. */
export async function applyMisuseCooldown(
  userId: string,
  reason: MisuseReason,
): Promise<ActiveCooldown> {
  const collection = await cooldownCollection();
  const now = new Date();
  const existing = await collection.findOne({ userId });

  let strikes = existing?.strikes ?? 0;
  const lastStrikeAt = existing?.lastStrikeAt;

  if (
    lastStrikeAt &&
    now.getTime() - lastStrikeAt.getTime() > STRIKE_RESET_MS
  ) {
    strikes = 0;
  }

  strikes += 1;
  const cooldownUntil = new Date(now.getTime() + COOLDOWN_MS);

  const doc: UserCooldownDocument = {
    userId,
    strikes,
    lastStrikeAt: now,
    cooldownUntil,
    lastReason: reason,
    updatedAt: now,
  };

  await collection.updateOne({ userId }, { $set: doc }, { upsert: true });

  return {
    cooldownUntil,
    strikes,
    lastReason: reason,
  };
}
