/**
 * Shared abuse-prevention limits. Imported by both the client (for UX) and the
 * server (for real enforcement), so the two never drift out of sync.
 */

/** Max messages a user may send per calendar day (UTC). */
export const DAILY_MESSAGE_LIMIT = 12;

/** Max characters allowed in a single user message (bounds per-request tokens). */
export const MAX_MESSAGE_CHARS = 4000;

/** Max user messages allowed in a single conversation. */
export const MAX_USER_MESSAGES_PER_SESSION = 50;

/** Max total messages (user + assistant) in a single conversation. */
export const MAX_TOTAL_MESSAGES_PER_SESSION = 100;
