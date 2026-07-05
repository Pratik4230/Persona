import type { UIMessage } from "ai";

import { getMessageText } from "@/lib/chat/types";

export type MessageSourceKind =
  | "youtube"
  | "docs"
  | "course"
  | "github"
  | "web";

export interface MessageSource {
  url: string;
  label: string;
  kind: MessageSourceKind;
}

interface WebSearchOutput {
  sources?: Array<{ type: string; url?: string; name?: string }>;
}

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
const BARE_URL_RE = /(?<!\]\()(https?:\/\/[^\s)<>]+)/g;

/** Junk or off-brand hosts to never show as source chips. */
const BLOCKED_HOSTS = new Set([
  "music.youtube.com",
  "developer.mozilla.org",
  "www.developer.mozilla.org",
]);

function isBlockedUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BLOCKED_HOSTS.has(host);
  } catch {
    return true;
  }
}

function kindFromHostname(hostname: string): MessageSourceKind {
  const host = hostname.toLowerCase();

  if (host.includes("youtube.com") || host.includes("youtu.be")) {
    return "youtube";
  }
  if (
    host.includes("nextjs.org") ||
    host.includes("react.dev") ||
    host.includes("nodejs.org") ||
    host.includes("typescriptlang.org") ||
    host.includes("docs.docker.com")
  ) {
    return "docs";
  }
  if (host.includes("github.com")) {
    return "github";
  }
  if (
    host.includes("chaicode.com") ||
    host.includes("piyushgarg.dev") ||
    host.includes("hitesh.ai") ||
    host.includes("hiteshchoudhary.com") ||
    host.includes("udemy.com")
  ) {
    return "course";
  }

  return "web";
}

function labelFromUrl(url: string, title?: string): string {
  if (title?.trim()) {
    return title.trim();
  }

  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function shortLabel(label: string, max = 42): string {
  if (label.length <= max) {
    return label;
  }
  return `${label.slice(0, max - 1).trimEnd()}…`;
}

function addSource(
  sources: MessageSource[],
  seen: Set<string>,
  url: string,
  title?: string,
) {
  if (isBlockedUrl(url)) {
    return;
  }

  try {
    const parsed = new URL(url);
    const href = parsed.href;
    if (seen.has(href)) {
      return;
    }
    seen.add(href);

    sources.push({
      url: href,
      label: shortLabel(labelFromUrl(href, title)),
      kind: kindFromHostname(parsed.hostname),
    });
  } catch {
    // Ignore invalid URLs.
  }
}

function getToolName(part: UIMessage["parts"][number]): string | null {
  if (part.type === "dynamic-tool") {
    return part.toolName;
  }
  if (part.type.startsWith("tool-")) {
    return part.type.slice("tool-".length);
  }
  return null;
}

function extractWebSearchSources(
  part: UIMessage["parts"][number],
): Array<{ url: string; title?: string }> {
  if (
    !("state" in part) ||
    part.state !== "output-available" ||
    !("output" in part)
  ) {
    return [];
  }

  if (getToolName(part) !== "web_search") {
    return [];
  }

  const output = part.output as WebSearchOutput;
  return (output.sources ?? [])
    .filter((source) => source.type === "url" && source.url)
    .map((source) => ({ url: source.url! }));
}

function extractFromMarkdown(text: string): Array<{ url: string; title?: string }> {
  const links: Array<{ url: string; title?: string }> = [];

  for (const match of text.matchAll(MARKDOWN_LINK_RE)) {
    links.push({ title: match[1], url: match[2] });
  }

  for (const match of text.matchAll(BARE_URL_RE)) {
    links.push({ url: match[0] });
  }

  return links;
}

/** Links from the reply markdown first, then web search (filtered). */
export function extractMessageSources(message: UIMessage): MessageSource[] {
  if (message.role !== "assistant") {
    return [];
  }

  const messageText = getMessageText(message);
  const sources: MessageSource[] = [];
  const seen = new Set<string>();

  for (const link of extractFromMarkdown(messageText)) {
    addSource(sources, seen, link.url, link.title);
  }

  if (sources.length > 0) {
    return sources.slice(0, 4);
  }

  for (const part of message.parts) {
    if (part.type === "source-url") {
      addSource(sources, seen, part.url, part.title);
      continue;
    }

    for (const link of extractWebSearchSources(part)) {
      addSource(sources, seen, link.url, link.title);
    }
  }

  return sources.slice(0, 4);
}
