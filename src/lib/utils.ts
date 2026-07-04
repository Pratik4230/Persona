import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Removes em/en dashes (— – ―) from model output — a common "AI tell". A dash
 * that sits between two non-space characters (ranges/compounds like `1–10`)
 * becomes a hyphen; a spaced dash used as a sentence break becomes a comma.
 * Idempotent, so it's safe to run on every streaming render.
 */
export function removeEmDashes(input: string): string {
  return input
    // Tight dash between two non-spaces (ranges/compounds like `1–10`) -> hyphen.
    .replace(/(\S)[—–―](\S)/g, "$1-$2")
    // A spaced dash used as a sentence break -> comma.
    .replace(/\s*[—–―]\s*/g, ", ")
    // Tidy stray spacing/commas that the replacements can introduce.
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",");
}
