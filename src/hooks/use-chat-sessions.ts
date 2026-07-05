"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { useCallback, useMemo } from "react";

import type { SessionMeta } from "@/lib/chat/types";
import type { PersonaId } from "@/lib/personas";

export const SESSIONS_KEY = ["chat-sessions"] as const;
export const USAGE_KEY = ["chat-usage"] as const;

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: async () => {
      const data = await fetchJson<{ sessions: SessionMeta[] }>(
        "/api/chat/sessions",
      );
      return data.sessions;
    },
  });
}

export function useUsage() {
  return useQuery({
    queryKey: USAGE_KEY,
    queryFn: () =>
      fetchJson<{ count: number; remaining: number; limit: number }>(
        "/api/chat/usage",
      ),
  });
}

export function useSessionActions() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
  }, [queryClient]);

  const invalidateUsage = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: USAGE_KEY });
  }, [queryClient]);

  const create = useCallback(
    async (personaId: PersonaId, title?: string) => {
      const data = await fetchJson<{ session: SessionMeta & { messages: UIMessage[] } }>(
        "/api/chat/sessions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personaId, title }),
        },
      );
      invalidate();
      return data.session;
    },
    [invalidate],
  );

  const saveMessages = useCallback(
    async (id: string, messages: UIMessage[]) => {
      await fetchJson(`/api/chat/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      invalidate();
    },
    [invalidate],
  );

  const rename = useCallback(
    async (id: string, title: string) => {
      await fetchJson(`/api/chat/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      invalidate();
    },
    [invalidate],
  );

  const remove = useCallback(
    async (id: string) => {
      await fetchJson(`/api/chat/sessions/${id}`, { method: "DELETE" });
      invalidate();
    },
    [invalidate],
  );

  const fetchSession = useCallback(async (id: string) => {
    const data = await fetchJson<{
      session: SessionMeta & { messages: UIMessage[] };
    }>(`/api/chat/sessions/${id}`);
    return data.session;
  }, []);

  return useMemo(
    () => ({
      create,
      saveMessages,
      rename,
      remove,
      fetchSession,
      invalidateUsage,
    }),
    [create, saveMessages, rename, remove, fetchSession, invalidateUsage],
  );
}

export function useMigrateLocalSessions() {
  return useMutation({
    mutationFn: async (sessions: unknown[]) => {
      const data = await fetchJson<{ imported: number }>("/api/chat/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions }),
      });
      return data.imported;
    },
  });
}
