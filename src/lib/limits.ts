/**
 * Shared abuse-prevention limits. Imported by both the client (for UX) and the
 * server (for real enforcement), so the two never drift out of sync.
 */

/** Max messages a single client may send per calendar day (UTC). */
export const DAILY_MESSAGE_LIMIT = 25;

/** Max characters allowed in a single user message (bounds per-request tokens). */
export const MAX_MESSAGE_CHARS = 4000;
