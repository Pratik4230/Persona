"use client";

import type { UIMessage } from "ai";
import type { RefObject } from "react";
import { useEffect } from "react";

import type { SessionMeta } from "@/lib/chat/types";
import type { PersonaId } from "@/lib/personas";

interface UseChatBootstrapOptions {
  sessions: SessionMeta[];
  bootstrapped: boolean;
  setBootstrapped: (value: boolean) => void;
  fetchSession: (id: string) => Promise<{ id: string; personaId: PersonaId; messages: UIMessage[] }>;
  setMessages: (messages: UIMessage[]) => void;
  setPersonaId: (id: PersonaId) => void;
  setActiveId: (id: string) => void;
  loadingRef: RefObject<boolean>;
}

export function useChatBootstrap({
  sessions,
  bootstrapped,
  setBootstrapped,
  fetchSession,
  setMessages,
  setPersonaId,
  setActiveId,
  loadingRef,
}: UseChatBootstrapOptions) {
  useEffect(() => {
    if (bootstrapped || sessions.length === 0) {
      return;
    }

    const latest = sessions[0];
    void fetchSession(latest.id).then((session) => {
      loadingRef.current = true;
      setPersonaId(session.personaId);
      setMessages(session.messages);
      setActiveId(session.id);
      setBootstrapped(true);
    });
  }, [
    bootstrapped,
    fetchSession,
    loadingRef,
    sessions,
    setActiveId,
    setBootstrapped,
    setMessages,
    setPersonaId,
  ]);
}
