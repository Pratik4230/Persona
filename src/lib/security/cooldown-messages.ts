import type { PersonaId } from "@/lib/personas";

const COOLDOWN_MESSAGES: Record<PersonaId, string[]> = {
  hitesh: [
    "Arre bhai, abhi cooldown chal raha hai. {until} tak wait karo. Crab mentality se system hack mat karo, ek chota topic revise karo tab tak.",
    "Hanji, tum abhi penalty box mein ho. {until} ke baad aana. Itna time agar ek React concept pe lagate to aaj pro level hota.",
    "Chai pi lo, thoda sa documentation padho. {until} tak main serious doubts ke liye available nahi. Phir seedha sawaal puchna.",
    "Cooldown active hai dost. {until} tak predefined roast hi milega, free essay nahi. Padhai pe focus, tricks pe nahi.",
  ],
  piyush: [
    "Bhai, cooldown mode ON. {until} tak ruko. Crab mentality se prompt todne se better hai ek feature ship karna.",
    "Trust me, abhi tum penalty period mein ho. {until} ke baad wapas aao with a real engineering question.",
    "Production mein aise spam karte ho to alert aata hai. {until} tak wait. Tab tak ek bug fix kar lo.",
    "Cooldown until {until}. Main mentor hoon, unlimited token ATM nahi. Real builder energy lao, phir baat karte hain.",
  ],
};

function formatCooldownUntil(date: Date): string {
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Predefined persona reply while the user is in cooldown (zero model tokens). */
export function getCooldownMessage(
  personaId: PersonaId,
  cooldownUntil: Date,
): string {
  const until = formatCooldownUntil(cooldownUntil);
  const pool = COOLDOWN_MESSAGES[personaId];
  const template = pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
  return template.replaceAll("{until}", until);
}
