"use client";

import {
  BookOpenIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  GraduationCapIcon,
  VideoIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type {
  MessageSource,
  MessageSourceKind,
} from "@/lib/resources/extract-message-sources";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<MessageSourceKind, typeof ExternalLinkIcon> = {
  youtube: VideoIcon,
  docs: BookOpenIcon,
  course: GraduationCapIcon,
  github: GitBranchIcon,
  web: ExternalLinkIcon,
};

export function MessageSources({
  sources,
  className,
}: {
  sources: MessageSource[];
  className?: string;
}) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5 pt-0.5", className)}
      data-slot="message-sources"
    >
      <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
        Sources
      </span>
      {sources.map((source) => {
        const Icon = KIND_ICON[source.kind];

        return (
          <Badge
            asChild
            className="max-w-[min(100%,16rem)] gap-1 rounded-full px-2.5 py-1 font-normal"
            key={source.url}
            title={source.label}
            variant="outline"
          >
            <a
              href={source.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon aria-hidden className="size-3 shrink-0" />
              <span className="truncate">{source.label}</span>
            </a>
          </Badge>
        );
      })}
    </div>
  );
}
