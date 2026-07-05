"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div
        className={cn(
          "w-full max-w-md space-y-6 rounded-2xl border bg-card/80 p-6 shadow-lg backdrop-blur-sm sm:p-8",
          className,
        )}
      >
        <div className="space-y-2 text-center">
          <Link
            className="inline-flex items-center gap-2 font-semibold text-lg tracking-tight"
            href="/"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 via-fuchsia-500 to-indigo-500 text-white text-sm">
              P
            </span>
            Persona AI
          </Link>
          <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        {children}

        {footer ? (
          <div className="border-t pt-4 text-center text-muted-foreground text-sm">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
