import Link from "next/link";

import type { PaginationMeta } from "@/lib/admin/types";

function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function AdminChrome({
  title,
  backHref,
  backLabel = "Back",
  children,
}: {
  title: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b px-4 py-3 sm:px-6">
        {backHref ? (
          <Link className="text-muted-foreground text-sm hover:text-foreground" href={backHref}>
            ← {backLabel}
          </Link>
        ) : (
          <Link className="text-muted-foreground text-sm hover:text-foreground" href="/">
            ← App
          </Link>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="mb-4 font-semibold text-xl">{title}</h1>
        {children}
      </main>
    </div>
  );
}

export function AdminPagination({
  basePath,
  pagination,
}: {
  basePath: string;
  pagination: PaginationMeta;
}) {
  const { page, totalPages, total, limit } = pagination;
  if (totalPages <= 1) {
    return (
      <p className="mt-4 text-muted-foreground text-sm">
        {total} result{total === 1 ? "" : "s"}
      </p>
    );
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">
        {start}–{end} of {total}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link className="underline" href={pageHref(basePath, page - 1)}>
            Prev
          </Link>
        ) : (
          <span className="text-muted-foreground">Prev</span>
        )}
        <span className="text-muted-foreground">
          {page}/{totalPages}
        </span>
        {page < totalPages ? (
          <Link className="underline" href={pageHref(basePath, page + 1)}>
            Next
          </Link>
        ) : (
          <span className="text-muted-foreground">Next</span>
        )}
      </div>
    </div>
  );
}
