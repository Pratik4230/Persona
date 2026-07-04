"use client";

import dynamic from "next/dynamic";

import { Spinner } from "@/components/ui/spinner";

// The chat experience is entirely client-side (its state lives in localStorage).
// Rendering it without SSR avoids server/client hydration mismatches and lets
// the first client render read localStorage directly, so saved conversations
// and their controls appear immediately instead of flashing an empty state.
const Chat = dynamic(() => import("@/components/chat").then((mod) => mod.Chat), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh items-center justify-center bg-background">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  ),
});

export function ChatApp() {
  return <Chat />;
}
