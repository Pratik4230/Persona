"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { CheckIcon, CopyIcon, PanelLeftIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { ChatSidebar } from "@/components/chat-sidebar";
import { PersonaSwitcher } from "@/components/persona-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSessionActions } from "@/hooks/use-chat-sessions";
import * as store from "@/lib/chat-store";
import { getMessageText } from "@/lib/chat-store";
import { DAILY_MESSAGE_LIMIT, MAX_MESSAGE_CHARS } from "@/lib/limits";
import {
  DEFAULT_PERSONA_ID,
  getPersona,
  type Persona,
  type PersonaId,
} from "@/lib/personas";
import { cn, removeEmDashes } from "@/lib/utils";

function PersonaAvatar({
  persona,
  className,
  ring,
}: {
  persona: Persona;
  className?: string;
  ring?: boolean;
}) {
  return (
    <Avatar
      className={cn(
        "shrink-0",
        ring && cn("ring-2 ring-offset-2 ring-offset-background", persona.accent.ring),
        className,
      )}
    >
      <AvatarImage alt={persona.name} src={persona.avatar} />
      <AvatarFallback>{persona.initials}</AvatarFallback>
    </Avatar>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => toast.error("Could not copy message"));
  }, [text]);

  return (
    <MessageAction onClick={handleCopy} tooltip={copied ? "Copied" : "Copy"}>
      {copied ? (
        <CheckIcon className="size-3.5 text-emerald-500" />
      ) : (
        <CopyIcon className="size-3.5" />
      )}
    </MessageAction>
  );
}

function TypingIndicator({ persona }: { persona: Persona }) {
  return (
    <Message className="flex-row items-start gap-3" from="assistant">
      <PersonaAvatar className="mt-0.5 size-8" persona={persona} />
      <MessageContent>
        <div aria-label="Typing" className="flex items-center gap-1 py-2">
          {[0, 1, 2].map((index) => (
            <span
              className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
              key={index}
              style={{ animationDelay: `${index * 0.15}s` }}
            />
          ))}
        </div>
      </MessageContent>
    </Message>
  );
}

function Hero({
  persona,
  onPick,
}: {
  persona: Persona;
  onPick: (text: string) => void;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-10 text-center"
      initial={{ opacity: 0, y: 12 }}
      key={persona.id}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="relative">
        <div
          aria-hidden
          className={cn(
            "-inset-3 absolute rounded-full opacity-40 blur-2xl",
            persona.accent.soft,
          )}
        />
        <PersonaAvatar
          className="relative size-24 shadow-xl"
          persona={persona}
          ring
        />
      </div>

      <div className="space-y-2">
        <h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">
          {persona.name}
        </h1>
        <p className={cn("font-medium text-sm", persona.accent.text)}>
          {persona.title} · {persona.tagline}
        </p>
        <p className="mx-auto max-w-md text-pretty text-muted-foreground text-sm leading-relaxed">
          {persona.greeting}
        </p>
      </div>

      <div className="flex max-w-lg flex-wrap justify-center gap-1.5">
        {persona.expertise.map((skill) => (
          <Badge key={skill} variant="secondary">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {persona.starters.map((starter) => (
          <button
            className={cn(
              "group rounded-xl border bg-card/50 px-4 py-3 text-left text-sm transition-all",
              "hover:border-transparent hover:bg-accent hover:shadow-sm",
              persona.accent.ring,
              "hover:ring-2",
            )}
            key={starter}
            onClick={() => onPick(starter)}
            type="button"
          >
            <span className="line-clamp-2 text-pretty">{starter}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {persona.links.map((link) => (
          <a
            className="rounded-full border px-3 py-1 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground"
            href={link.href}
            key={link.href}
            rel="noopener noreferrer"
            target="_blank"
          >
            {link.label}
          </a>
        ))}
      </div>
    </motion.div>
  );
}

export function Chat() {
  // One-time synchronous read of the last session from localStorage. Runs only
  // on the client (the chat UI is rendered client-only, see chat-app.tsx), so
  // there's no hydration mismatch and the restored conversation shows on the
  // first paint instead of flashing an empty state.
  const [bootstrap] = useState(() => {
    const lastId = store.getActiveSessionId();
    const index = store.getSessionIndex();
    const session =
      (lastId ? store.getSession(lastId) : null) ??
      (index[0] ? store.getSession(index[0].id) : null);
    return { session, remaining: store.getUsageToday().remaining };
  });

  const [personaId, setPersonaId] = useState<PersonaId>(
    bootstrap.session?.personaId ?? DEFAULT_PERSONA_ID,
  );
  const [activeId, setActiveId] = useState<string | null>(
    bootstrap.session?.id ?? null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [remaining, setRemaining] = useState(bootstrap.remaining);
  const persona = getPersona(personaId);
  const limitReached = remaining <= 0;

  const { create, saveMessages, remove } = useSessionActions();

  // When true, the next persistence pass is skipped (used when loading a stored
  // session so we don't immediately re-write / re-order it). Starts true when a
  // conversation was restored on mount, so that initial state isn't re-saved.
  const loadingRef = useRef(bootstrap.session != null);

  const { messages, sendMessage, status, stop, error, regenerate, setMessages } =
    useChat({
      messages: bootstrap.session?.messages ?? [],
      transport: new DefaultChatTransport({
        api: "/api/chat",
        body: { persona: personaId },
      }),
      onError: (chatError) => {
        toast.error(
          chatError.message || "Something went wrong. Please try again.",
        );
      },
    });

  const isBusy = status === "submitted" || status === "streaming";
  const hasMessages = messages.length > 0;
  const firstName = persona.name.split(" ")[0];

  // Persist the conversation whenever a turn completes.
  useEffect(() => {
    if (loadingRef.current) {
      loadingRef.current = false;
      return;
    }
    if (!activeId || messages.length === 0) {
      return;
    }
    if (status === "streaming" || status === "submitted") {
      return;
    }
    saveMessages(activeId, messages);
  }, [status, messages, activeId, saveMessages]);

  const startFresh = useCallback(
    (nextPersona: PersonaId) => {
      stop();
      loadingRef.current = true;
      setMessages([]);
      setPersonaId(nextPersona);
      setActiveId(null);
      store.setActiveSessionId(null);
    },
    [setMessages, stop],
  );

  const handleNewChat = useCallback(() => {
    startFresh(personaId);
  }, [personaId, startFresh]);

  const handlePersonaChange = useCallback(
    (id: PersonaId) => {
      if (id === personaId) {
        return;
      }
      startFresh(id);
    },
    [personaId, startFresh],
  );

  const handleSelectSession = useCallback(
    (id: string) => {
      const session = store.getSession(id);
      if (!session) {
        return;
      }
      stop();
      loadingRef.current = true;
      setPersonaId(session.personaId);
      setMessages(session.messages);
      setActiveId(id);
      store.setActiveSessionId(id);
    },
    [setMessages, stop],
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      remove(id);
      toast.success("Chat deleted");
      if (id === activeId) {
        const remaining = store.getSessionIndex();
        if (remaining.length > 0) {
          handleSelectSession(remaining[0].id);
        } else {
          startFresh(personaId);
        }
      }
    },
    [activeId, handleSelectSession, personaId, remove, startFresh],
  );

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBusy) {
        return;
      }

      if (store.getUsageToday().remaining <= 0) {
        setRemaining(0);
        toast.error(
          `Daily limit reached. You can send ${DAILY_MESSAGE_LIMIT} messages per day, please come back tomorrow.`,
        );
        return;
      }

      if (trimmed.length > MAX_MESSAGE_CHARS) {
        toast.error(
          `Message is too long (max ${MAX_MESSAGE_CHARS} characters). Please shorten it.`,
        );
        return;
      }

      if (!activeId) {
        const title =
          trimmed.length > 48 ? `${trimmed.slice(0, 48).trimEnd()}…` : trimmed;
        const session = create(personaId, title);
        setActiveId(session.id);
        store.setActiveSessionId(session.id);
      }

      sendMessage({ text: trimmed });
      setRemaining(store.consumeUsage().remaining);
    },
    [activeId, create, isBusy, personaId, sendMessage],
  );

  // Keyboard shortcut: ⌘/Ctrl + Shift + O → new chat.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "o"
      ) {
        event.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNewChat]);

  const lastMessageIndex = messages.length - 1;

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <ChatSidebar
        activeId={activeId}
        className="hidden w-72 shrink-0 border-r md:flex"
        onDelete={handleDeleteSession}
        onNew={handleNewChat}
        onSelect={handleSelectSession}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
          <div className="flex w-full items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    aria-label="Open chats"
                    className="md:hidden"
                    size="icon"
                    variant="ghost"
                  >
                    <PanelLeftIcon className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-80 p-0" side="left">
                  <SheetTitle className="sr-only">Chats</SheetTitle>
                  <ChatSidebar
                    activeId={activeId}
                    className="h-full w-full"
                    onDelete={handleDeleteSession}
                    onNavigate={() => setSheetOpen(false)}
                    onNew={handleNewChat}
                    onSelect={handleSelectSession}
                  />
                </SheetContent>
              </Sheet>

              <PersonaAvatar
                className="size-8 sm:size-9"
                persona={persona}
                ring
              />
              <div className="min-w-0 leading-tight">
                <p className="truncate font-semibold text-sm">{persona.name}</p>
                <p className="hidden truncate text-muted-foreground text-xs sm:block">
                  {persona.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <PersonaSwitcher
                activeId={personaId}
                onChange={handlePersonaChange}
              />
              <Button
                aria-label="New chat"
                className="md:hidden"
                onClick={handleNewChat}
                size="icon"
                variant="ghost"
              >
                <PlusIcon className="size-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex min-h-0 flex-1 flex-col">
          <Conversation>
            <ConversationContent className="mx-auto w-full max-w-3xl">
              {hasMessages ? (
                messages.map((message, index) => {
                  const isAssistant = message.role === "assistant";
                  const isStreamingLast =
                    status === "streaming" && index === lastMessageIndex;
                  const showActions = isAssistant && !isStreamingLast;
                  const canRegenerate =
                    isAssistant &&
                    index === lastMessageIndex &&
                    !isBusy;
                  const rawText = getMessageText(message);
                  const text = isAssistant
                    ? removeEmDashes(rawText)
                    : rawText;

                  return (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full"
                      initial={{ opacity: 0, y: 8 }}
                      key={message.id}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <Message
                        className={cn(
                          isAssistant && "flex-row items-start gap-3",
                        )}
                        from={message.role}
                      >
                        {isAssistant && (
                          <PersonaAvatar
                            className="mt-0.5 size-8"
                            persona={persona}
                          />
                        )}
                        <div className="flex min-w-0 flex-col gap-1.5">
                          <MessageContent>
                            {message.parts.map((part, partIndex) =>
                              part.type === "text" ? (
                                <MessageResponse
                                  key={`${message.id}-${partIndex}`}
                                >
                                  {isAssistant
                                    ? removeEmDashes(part.text)
                                    : part.text}
                                </MessageResponse>
                              ) : null,
                            )}
                          </MessageContent>

                          {showActions && text.length > 0 && (
                            <MessageActions className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                              <CopyButton text={text} />
                              {canRegenerate && (
                                <MessageAction
                                  onClick={() => regenerate()}
                                  tooltip="Regenerate"
                                >
                                  <RefreshCwIcon className="size-3.5" />
                                </MessageAction>
                              )}
                            </MessageActions>
                          )}
                        </div>
                      </Message>
                    </motion.div>
                  );
                })
              ) : (
                <Hero onPick={submit} persona={persona} />
              )}

              {status === "submitted" && <TypingIndicator persona={persona} />}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="mx-auto w-full max-w-3xl px-3 pb-4 sm:px-4">
            {error && (
              <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                <span className="text-destructive">
                  Something went wrong. Please try again.
                </span>
                <Button
                  onClick={() => regenerate()}
                  size="sm"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            )}

            {limitReached && (
              <div className="mb-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-700 text-sm dark:text-amber-400">
                You have reached today&apos;s limit of {DAILY_MESSAGE_LIMIT}{" "}
                messages. Please come back tomorrow. Your saved chats stay right
                here.
              </div>
            )}

            <PromptInput
              className="rounded-2xl border-input shadow-sm"
              onSubmit={(message) => submit(message.text)}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  disabled={limitReached && !isBusy}
                  maxLength={MAX_MESSAGE_CHARS}
                  placeholder={
                    limitReached
                      ? "Daily limit reached, back tomorrow…"
                      : `Message ${firstName}…`
                  }
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <span className="truncate px-1 text-muted-foreground text-xs">
                    {persona.tagline}
                  </span>
                </PromptInputTools>
                <PromptInputSubmit
                  className={cn(
                    "bg-linear-to-br text-white transition-opacity hover:opacity-90",
                    persona.accent.gradient,
                  )}
                  disabled={limitReached && !isBusy}
                  onStop={stop}
                  status={status}
                />
              </PromptInputFooter>
            </PromptInput>

            <p className="mt-2 text-center text-muted-foreground text-xs">
              <span
                className={cn(
                  "font-medium",
                  remaining <= 5 && "text-amber-600 dark:text-amber-500",
                )}
              >
                {remaining}/{DAILY_MESSAGE_LIMIT} messages left today
              </span>{" "}
              · AI persona for educational/demo purposes and may be inaccurate.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
