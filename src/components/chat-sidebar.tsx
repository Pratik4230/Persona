"use client";

import Image from "next/image";
import { MessageSquarePlusIcon, Trash2Icon, UserRoundIcon } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BuilderCredits } from "@/components/builder-credits";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSessions } from "@/hooks/use-chat-sessions";
import type { SessionMeta } from "@/lib/chat/types";
import { getPersona } from "@/lib/personas";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  /** Fired after a navigation action, used to close the mobile drawer. */
  onNavigate?: () => void;
  className?: string;
}

function formatRelative(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

const DAY = 86_400_000;

function groupSessions(sessions: SessionMeta[]): [string, SessionMeta[]][] {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  const buckets: Record<string, SessionMeta[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 days": [],
    Older: [],
  };

  for (const session of sessions) {
    if (session.updatedAt >= startOfToday) {
      buckets.Today.push(session);
    } else if (session.updatedAt >= startOfToday - DAY) {
      buckets.Yesterday.push(session);
    } else if (session.updatedAt >= startOfToday - 7 * DAY) {
      buckets["Previous 7 days"].push(session);
    } else {
      buckets.Older.push(session);
    }
  }

  return Object.entries(buckets).filter(([, items]) => items.length > 0);
}

export function ChatSidebar({
  activeId,
  onSelect,
  onNew,
  onDelete,
  onNavigate,
  className,
}: ChatSidebarProps) {
  const { data: sessions = [] } = useSessions();
  const [deleteTarget, setDeleteTarget] = useState<SessionMeta | null>(null);

  const groups = groupSessions(sessions);

  const handleSelect = (id: string) => {
    onSelect(id);
    onNavigate?.();
  };

  const handleNew = () => {
    onNew();
    onNavigate?.();
  };

  return (
    <div className={cn("flex h-full flex-col bg-muted/30", className)}>
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 via-orange-600 to-zinc-950 text-white shadow-sm">
          <UserRoundIcon className="size-4" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-semibold text-sm">Persona AI</p>
          <p className="truncate text-muted-foreground text-xs">
            Tech educator personas
          </p>
        </div>
      </div>

      <div className="px-3 pb-2">
        <Button
          className="w-full justify-start gap-2 shadow-sm"
          onClick={handleNew}
          variant="default"
        >
          <MessageSquarePlusIcon className="size-4" />
          New chat
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
            <p className="font-medium text-sm">No chats yet</p>
            <p className="text-muted-foreground text-xs">
              Start a new conversation to see it here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-4">
            {groups.map(([label, items]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <p className="px-2 pb-1 font-medium text-muted-foreground text-xs">
                  {label}
                </p>
                {items.map((session) => {
                  const persona = getPersona(session.personaId);
                  const isActive = session.id === activeId;
                  return (
                    <div
                      className={cn(
                        "group/item relative flex items-center gap-2 rounded-lg pr-1 transition-colors",
                        isActive
                          ? "bg-accent"
                          : "hover:bg-accent/60",
                      )}
                      key={session.id}
                    >
                      <button
                        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg py-2 pl-2 text-left"
                        onClick={() => handleSelect(session.id)}
                        type="button"
                      >
                        <Image
                          alt={persona.name}
                          className="size-6 shrink-0 rounded-full object-cover ring-1 ring-border"
                          height={24}
                          src={persona.avatar}
                          width={24}
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium text-sm">
                            {session.title}
                          </span>
                          <span className="truncate text-muted-foreground text-xs">
                            {persona.name.split(" ")[0]} ·{" "}
                            {formatRelative(session.updatedAt)}
                          </span>
                        </span>
                      </button>

                      <Button
                        aria-label={`Delete "${session.title}"`}
                        className="size-7 shrink-0 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(session)}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="space-y-3 border-t px-4 py-3">
        <p className="text-muted-foreground text-xs">
          {sessions.length} {sessions.length === 1 ? "chat" : "chats"} · synced
          to your account
        </p>
        <BuilderCredits variant="sidebar" />
      </div>

      <AlertDialog
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        open={deleteTarget !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.title}&rdquo; will be permanently removed.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/30"
              onClick={() => {
                if (deleteTarget) {
                  onDelete(deleteTarget.id);
                }
                setDeleteTarget(null);
              }}
            >
              <Trash2Icon />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
