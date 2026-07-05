"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import {
  useMigrateLocalSessions,
  useSessionActions,
} from "@/hooks/use-chat-sessions";
import {
  hasMigratedLocally,
  markMigratedLocally,
  readLegacyLocalSessions,
} from "@/lib/chat/migration";

/** One-time import of browser localStorage chats after authentication. */
export function useLocalSessionMigration() {
  const migrate = useMigrateLocalSessions();
  const { invalidateUsage } = useSessionActions();
  const started = useRef(false);

  useEffect(() => {
    if (started.current || hasMigratedLocally()) {
      return;
    }
    started.current = true;

    const legacy = readLegacyLocalSessions();
    if (legacy.length === 0) {
      markMigratedLocally();
      return;
    }

    migrate.mutate(legacy, {
      onSuccess: (imported) => {
        markMigratedLocally();
        invalidateUsage();
        if (imported > 0) {
          toast.success(
            `Imported ${imported} chat${imported === 1 ? "" : "s"} from this device.`,
          );
        }
      },
      onError: () => {
        started.current = false;
        toast.error("Could not import local chats. They are still on this device.");
      },
    });
  }, [migrate, invalidateUsage]);
}
