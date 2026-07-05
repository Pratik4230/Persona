import type { UIMessage } from "ai";

import type { PersonaId } from "@/lib/personas";

/** Application chat session stored in MongoDB (separate from Better Auth sessions). */
export interface ChatSessionDocument {
  id: string;
  userId: string;
  personaId: PersonaId;
  title: string;
  messages: UIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/** Per-user daily message quota. */
export interface DailyUsageDocument {
  userId: string;
  /** UTC day (YYYY-MM-DD). */
  day: string;
  count: number;
}

/** Misuse cooldown state (separate from Better Auth sessions). */
export interface UserCooldownDocument {
  userId: string;
  strikes: number;
  lastStrikeAt: Date;
  cooldownUntil: Date;
  lastReason: string;
  updatedAt: Date;
}

export const COLLECTIONS = {
  chatSessions: "chat_sessions",
  dailyUsage: "daily_usage",
  userCooldowns: "user_cooldowns",
} as const;
