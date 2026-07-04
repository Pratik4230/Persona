"use client";

import Image from "next/image";

import { PERSONA_LIST, type PersonaId } from "@/lib/personas";
import { cn } from "@/lib/utils";

interface PersonaSwitcherProps {
  activeId: PersonaId;
  onChange: (id: PersonaId) => void;
}

export function PersonaSwitcher({ activeId, onChange }: PersonaSwitcherProps) {
  return (
    <div
      aria-label="Choose persona"
      className="inline-flex items-center gap-1 rounded-full border bg-muted/40 p-1"
      role="tablist"
    >
      {PERSONA_LIST.map((persona) => {
        const isActive = persona.id === activeId;
        return (
          <button
            aria-selected={isActive}
            className={cn(
              "flex items-center gap-2 rounded-full px-2 py-1 text-sm transition-colors sm:px-2.5 sm:py-1.5",
              isActive
                ? cn("bg-background shadow-sm ring-2", persona.accent.ring)
                : "text-muted-foreground hover:text-foreground",
            )}
            key={persona.id}
            onClick={() => onChange(persona.id)}
            role="tab"
            type="button"
          >
            <Image
              alt={persona.name}
              className="size-6 rounded-full object-cover"
              height={24}
              src={persona.avatar}
              width={24}
            />
            <span
              className={cn(
                "hidden font-medium sm:inline",
                isActive && persona.accent.text,
              )}
            >
              {persona.name.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
