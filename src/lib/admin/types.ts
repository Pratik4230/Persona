import type { UIMessage } from "ai";

import type { PersonaId } from "@/lib/personas";

export const ADMIN_PAGE_SIZE = 25;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  conversationCount: number;
}

export interface AdminSessionSummary {
  id: string;
  personaId: PersonaId;
  title: string;
  updatedAt: string;
}

export interface AdminSessionDetail {
  id: string;
  personaId: PersonaId;
  title: string;
  updatedAt: string;
  messages: UIMessage[];
}

export function paginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function formatDate(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export { formatDate as formatAdminDate };
