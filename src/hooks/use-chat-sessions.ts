"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { useCallback, useMemo } from "react";

import * as store from "@/lib/chat-store";
import type { PersonaId } from "@/lib/personas";

export const SESSIONS_KEY = ["chat-sessions"] as const;

/** Reactive list of session metadata (newest first), shared across components. */
export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: () => store.getSessionIndex(),
    // Read localStorage synchronously on first render so saved chats (and their
    // delete buttons) show up immediately instead of after an async refetch.
    // Safe because the chat UI is rendered client-only (see chat-app.tsx).
    initialData: () => store.getSessionIndex(),
  });
}

/** Mutations for the session store; every write invalidates the shared list. */
export function useSessionActions() {
  const queryClient = useQueryClient();

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: SESSIONS_KEY }),
    [queryClient],
  );

  const create = useCallback(
    (personaId: PersonaId, title?: string) => {
      const session = store.createSession(personaId, title);
      invalidate();
      return session;
    },
    [invalidate],
  );

  const saveMessages = useCallback(
    (id: string, messages: UIMessage[]) => {
      store.saveSessionMessages(id, messages);
      invalidate();
    },
    [invalidate],
  );

  const rename = useCallback(
    (id: string, title: string) => {
      store.renameSession(id, title);
      invalidate();
    },
    [invalidate],
  );

  const remove = useCallback(
    (id: string) => {
      store.deleteSession(id);
      invalidate();
    },
    [invalidate],
  );

  return useMemo(
    () => ({ create, saveMessages, rename, remove }),
    [create, saveMessages, rename, remove],
  );
}
