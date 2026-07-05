import type { PersonaId } from "@/lib/personas";

/** Persona-owned + course platforms only. No MDN — model should use canonical links instead. */
const PERSONA_DOMAINS: Record<PersonaId, readonly string[]> = {
  hitesh: [
    "youtube.com",
    "youtu.be",
    "chaicode.com",
    "hitesh.ai",
    "hiteshchoudhary.com",
    "udemy.com",
    "github.com",
  ],
  piyush: [
    "youtube.com",
    "youtu.be",
    "piyushgarg.dev",
    "pro.piyushgarg.dev",
    "learn.piyushgarg.dev",
    "udemy.com",
    "github.com",
  ],
};

export function getWebSearchDomains(personaId: PersonaId): string[] {
  return [...PERSONA_DOMAINS[personaId]];
}
