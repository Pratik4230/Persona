"use client";

import type { UIMessage } from "ai";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { MessageSources } from "@/components/message-sources";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Persona, PersonaId } from "@/lib/personas";
import { getPersona } from "@/lib/personas";
import { extractMessageSources } from "@/lib/resources/extract-message-sources";
import { cn, removeEmDashes } from "@/lib/utils";

function PersonaAvatar({
  persona,
  className,
}: {
  persona: Persona;
  className?: string;
}) {
  return (
    <Avatar className={cn("shrink-0", className)}>
      <AvatarImage alt={persona.name} src={persona.avatar} />
      <AvatarFallback>{persona.initials}</AvatarFallback>
    </Avatar>
  );
}

export function AdminConversationView({
  personaId,
  messages,
}: {
  personaId: PersonaId;
  messages: UIMessage[];
}) {
  const persona = getPersona(personaId);

  return (
    <Conversation
      className="h-[min(70dvh,720px)] rounded-xl border bg-card"
      initial={false}
      resize="instant"
    >
      <ConversationContent className="mx-auto w-full max-w-3xl">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground text-sm">
            No messages.
          </p>
        ) : (
          messages.map((message) => {
            const isAssistant = message.role === "assistant";

            return (
              <Message
                className={cn(isAssistant && "flex-row items-start gap-3")}
                from={message.role}
                key={message.id}
              >
                {isAssistant ? (
                  <PersonaAvatar className="mt-0.5 size-8" persona={persona} />
                ) : null}
                <div className="flex min-w-0 flex-col gap-1.5">
                  <MessageContent>
                    {message.parts.map((part, partIndex) =>
                      part.type === "text" ? (
                        <MessageResponse key={`${message.id}-${partIndex}`}>
                          {isAssistant ? removeEmDashes(part.text) : part.text}
                        </MessageResponse>
                      ) : null,
                    )}
                  </MessageContent>
                  {isAssistant ? (
                    <MessageSources sources={extractMessageSources(message)} />
                  ) : null}
                </div>
              </Message>
            );
          })
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
