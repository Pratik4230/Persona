import Link from "next/link";

import { AdminChrome, AdminPagination } from "@/components/admin/admin-chrome";
import { ADMIN_PAGE_SIZE, formatAdminDate } from "@/lib/admin/types";
import { listAdminUsers } from "@/lib/admin/repository";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);
  const { items, pagination } = await listAdminUsers(page, ADMIN_PAGE_SIZE);

  return (
    <AdminChrome title="Users">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Verified</th>
              <th className="px-3 py-2 font-medium">Joined</th>
              <th className="px-3 py-2 text-right font-medium">Chats</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-muted-foreground" colSpan={5}>
                  No users yet.
                </td>
              </tr>
            ) : (
              items.map((user) => (
                <tr className="border-b last:border-b-0" key={user.id}>
                  <td className="px-3 py-2">
                    <Link className="font-medium hover:underline" href={`/admin/users/${user.id}`}>
                      {user.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{user.email}</td>
                  <td className="px-3 py-2">{user.emailVerified ? "Yes" : "No"}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {formatAdminDate(user.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{user.conversationCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination basePath="/admin" pagination={pagination} />
    </AdminChrome>
  );
}
