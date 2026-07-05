import { openai } from "@ai-sdk/openai";

import { getWebSearchDomains } from "@/lib/resources/web-search-domains";
import type { PersonaId } from "@/lib/personas";

/** OpenAI-hosted web search scoped to trusted persona + docs domains. */
export function createPersonaWebSearchTool(personaId: PersonaId) {
  return openai.tools.webSearch({
    externalWebAccess: true,
    searchContextSize: "high",
    userLocation: {
      type: "approximate",
      country: "IN",
    },
    filters: {
      allowedDomains: getWebSearchDomains(personaId),
    },
  });
}
