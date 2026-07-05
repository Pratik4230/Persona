import { BUILDER, type BuilderLink } from "@/lib/builder-links";
import { cn } from "@/lib/utils";

const linkClassName =
  "rounded-full border px-2.5 py-0.5 text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-foreground";

function LinkPills({ links }: { links: readonly BuilderLink[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {links.map((link) => (
        <a
          className={linkClassName}
          href={link.href}
          key={link.href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

interface BuilderCreditsProps {
  variant?: "sidebar" | "login";
  className?: string;
}

export function BuilderCredits({
  variant = "sidebar",
  className,
}: BuilderCreditsProps) {
  const isLogin = variant === "login";

  return (
    <div
      className={cn(
        "space-y-2.5",
        isLogin ? "text-center" : "text-left",
        className,
      )}
    >
      <div className={cn("space-y-1.5", isLogin && "flex flex-col items-center")}>
        <p className="text-muted-foreground text-xs">
          Built by{" "}
          <span className="font-medium text-foreground">{BUILDER.name}</span>
        </p>
        <LinkPills links={BUILDER.socials} />
      </div>

      <div className={cn("space-y-1.5", isLogin && "flex flex-col items-center")}>
        <p className="text-muted-foreground text-xs">
          Also try{" "}
          <span className="font-medium text-foreground">
            {BUILDER.product.name}
          </span>
          <span className="hidden sm:inline"> — {BUILDER.product.tagline}</span>
        </p>
        <LinkPills links={BUILDER.product.links} />
      </div>
    </div>
  );
}
