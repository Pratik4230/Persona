import type { PersonaId } from "@/lib/personas";
import type { MisuseReason } from "@/lib/security/cooldown-repository";

const FIRST_STRIKE_MESSAGES: Record<
  PersonaId,
  Record<MisuseReason, string[]>
> = {
  hitesh: {
    prompt_injection: [
      "Arre bhai, system prompt chori karne aaye ho? Crab mentality hai ye. 72 ghante cooldown. Padhai karo, hack nahi.",
      "Hanji, mera prompt nahi milega. Study ke bahane injection? Nice try. Cooldown lag gaya, ab React revise karo.",
    ],
    token_farming: [
      "Bhai poora syllabus ek message mein? Token farming mat karo. Cooldown on. Chai pi ke ek chota topic seekho.",
      "Essay likhwane aaye ho mentor se? Crab mentality. 72 hour break lo, phir focused doubt puchna.",
    ],
    jailbreak: [
      "Jailbreak mode off hai yahan. Cooldown lag gaya. Real coding doubt lao, tricks nahi.",
    ],
    off_topic_spam: [
      "Spam mode band karo. Cooldown active. Ek clear engineering question lao next time.",
    ],
    other: [
      "Misuse detect hua. Cooldown lag gaya. Padhai pe focus, shortcuts pe nahi.",
    ],
  },
  piyush: {
    prompt_injection: [
      "Bhai, system prompt leak karne aaye ho? Production mein aise log ko block karte hain. 72h cooldown. Ship something instead.",
      "Trust me, mera instructions dump nahi hoga. Crab mentality se better hai ek PR raise karna. Cooldown ON.",
    ],
    token_farming: [
      "Unlimited essay generator main nahi hoon. Token farming detected, cooldown applied. Go fix a bug.",
      "Without stopping likhne aaye ho? Builder energy chahiye, spam nahi. 72 hour penalty.",
    ],
    jailbreak: [
      "Jailbreak try mat karo bhai. Cooldown lag gaya. Real dev question lao.",
    ],
    off_topic_spam: [
      "Off topic spam = cooldown. Focused engineering doubt next time.",
    ],
    other: [
      "Misuse flagged. Cooldown on. Come back with a real builder question.",
    ],
  },
};

/** Predefined roast when the model flags first-time misuse. */
export function getFirstStrikeRoast(
  personaId: PersonaId,
  reason: MisuseReason,
): string {
  const pool =
    FIRST_STRIKE_MESSAGES[personaId][reason] ??
    FIRST_STRIKE_MESSAGES[personaId].other;
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}
