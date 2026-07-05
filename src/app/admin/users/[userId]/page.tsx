import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminChrome, AdminPagination } from "@/components/admin/admin-chrome";
import { ADMIN_PAGE_SIZE, formatAdminDate } from "@/lib/admin/types";
import { getAdminUser, listAdminUserSessions } from "@/lib/admin/repository";
import { getPersona } from "@/lib/personas";

export default async function AdminUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { userId } = await params;
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const [user, sessions] = await Promise.all([
    getAdminUser(userId),
    listAdminUserSessions(userId, page, ADMIN_PAGE_SIZE),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <AdminChrome backHref="/admin" backLabel="Users" title={user.name}>
      <p className="mb-4 text-muted-foreground text-sm">
        {user.email} · {user.emailVerified ? "Verified" : "Unverified"} ·{" "}
        {user.conversationCount} chats
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Persona</th>
              <th className="px-3 py-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {sessions.items.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-muted-foreground" colSpan={3}>
                  No conversations.
                </td>
              </tr>
            ) : (
              sessions.items.map((session) => (
                <tr className="border-b last:border-b-0" key={session.id}>
                  <td className="px-3 py-2">
                    <Link
                      className="font-medium hover:underline"
                      href={`/admin/users/${userId}/sessions/${session.id}`}
                    >
                      {session.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {getPersona(session.personaId).name}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatAdminDate(session.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        basePath={`/admin/users/${userId}`}
        pagination={sessions.pagination}
      />
    </AdminChrome>
  );
}
