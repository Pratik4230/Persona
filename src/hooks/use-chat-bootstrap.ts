"use client";

import type { UIMessage } from "ai";
import type { RefObject } from "react";
import { useEffect } from "react";

import type { SessionMeta } from "@/lib/chat/types";
import type { PersonaId } from "@/lib/personas";

interface UseChatBootstrapOptions {
  sessions: SessionMeta[];
  /** True once the sessions query has resolved (avoids treating "loading" as empty). */
  sessionsReady: boolean;
  bootstrapped: boolean;
  setBootstrapped: (value: boolean) => void;
  fetchSession: (id: string) => Promise<{ id: string; personaId: PersonaId; messages: UIMessage[] }>;
  setMessages: (messages: UIMessage[]) => void;
  setPersonaId: (id: PersonaId) => void;
  setActiveId: (id: string) => void;
  loadingRef: RefObject<boolean>;
}

/** Restore the latest saved session once on load. Never runs again after bootstrap. */
export function useChatBootstrap({
  sessions,
  sessionsReady,
  bootstrapped,
  setBootstrapped,
  fetchSession,
  setMessages,
  setPersonaId,
  setActiveId,
  loadingRef,
}: UseChatBootstrapOptions) {
  const latestSessionId = sessions[0]?.id ?? null;

  useEffect(() => {
    if (bootstrapped || !sessionsReady) {
      return;
    }

    if (!latestSessionId) {
      setBootstrapped(true);
      return;
    }

    let cancelled = false;

    void fetchSession(latestSessionId).then((session) => {
      if (cancelled) {
        return;
      }
      loadingRef.current = true;
      setPersonaId(session.personaId);
      setMessages(session.messages);
      setActiveId(session.id);
      setBootstrapped(true);
    });

    return () => {
      cancelled = true;
    };
  }, [
    bootstrapped,
    fetchSession,
    latestSessionId,
    loadingRef,
    sessionsReady,
    setActiveId,
    setBootstrapped,
    setMessages,
    setPersonaId,
  ]);
}
