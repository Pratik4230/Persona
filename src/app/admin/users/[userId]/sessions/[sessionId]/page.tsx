import { notFound } from "next/navigation";

import { AdminConversationView } from "@/components/admin/admin-conversation-view";
import { AdminChrome } from "@/components/admin/admin-chrome";
import { formatAdminDate } from "@/lib/admin/types";
import { getAdminSessionDetail, getAdminUserName } from "@/lib/admin/repository";
import { getPersona } from "@/lib/personas";

export default async function AdminSessionPage({
  params,
}: {
  params: Promise<{ userId: string; sessionId: string }>;
}) {
  const { userId, sessionId } = await params;

  const [userName, session] = await Promise.all([
    getAdminUserName(userId),
    getAdminSessionDetail(userId, sessionId),
  ]);

  if (!userName || !session) {
    notFound();
  }

  const persona = getPersona(session.personaId);

  return (
    <AdminChrome
      backHref={`/admin/users/${userId}`}
      backLabel="Conversations"
      title={session.title}
    >
      <p className="mb-4 text-muted-foreground text-sm">
        {userName} · {persona.name} · {session.messages.length} messages · Updated{" "}
        {formatAdminDate(session.updatedAt)}
      </p>

      <AdminConversationView
        messages={session.messages}
        personaId={session.personaId}
      />
    </AdminChrome>
  );
}
