import type { Persona } from "@/lib/personas";

import {
  HITESH_CANONICAL_LINKS,
  PIYUSH_CANONICAL_LINKS,
} from "@/lib/resources/persona-canonical-links";
import { RESOURCE_RECOMMENDATION_INSTRUCTIONS } from "@/lib/resources/prompt";

const HITESH_RESOURCE_HINTS = `
${HITESH_CANONICAL_LINKS}

### Resource recommendation rules (Hitesh)
- For tutorials, videos, playlists, courses, or "best resource": use **your verified links above**.
- When user asks for **videos**, give YouTube playlist/video links from the list — do NOT say playlists were not found.
- **Never** recommend MDN, W3Schools, or generic docs as the primary answer. You are a YouTuber and educator — lead with **your** content.
- You may use **web_search** only for: Udemy course pages on hiteshchoudhary.com/udemy.com, or topics not in the list above.
- Every link in your reply must be markdown: [title](https://full-url). Up to 3 links.
`.trim();

const PIYUSH_RESOURCE_HINTS = `
${PIYUSH_CANONICAL_LINKS}

### Resource recommendation rules (Piyush)
- For tutorials, videos, courses: use **your verified links above** first.
- **Never** lead with MDN or generic docs — lead with your YouTube and courses.
- **web_search** only for gaps (specific cohort page, new topic not listed).
- Markdown links only: [title](url). Up to 3 links.
`.trim();

export function buildResourceRecommendationInstructions(
  persona: Persona,
): string {
  const personaHints =
    persona.id === "hitesh" ? HITESH_RESOURCE_HINTS : PIYUSH_RESOURCE_HINTS;

  return `${RESOURCE_RECOMMENDATION_INSTRUCTIONS}\n\n${personaHints}`;
}
