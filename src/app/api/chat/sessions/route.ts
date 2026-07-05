import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api/session";
import {
  createSession,
  getUsageToday,
  listSessions,
  migrateSessions,
  type MigrateSessionInput,
} from "@/lib/chat/repository";
import { isPersonaId, type PersonaId } from "@/lib/personas";

export async function GET() {
  const authResult = await requireSession();
  if ("response" in authResult) {
    return authResult.response;
  }

  const sessions = await listSessions(authResult.session.user.id);
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const authResult = await requireSession();
  if ("response" in authResult) {
    return authResult.response;
  }

  let body: { personaId?: string; title?: string };
  try {
    body = (await request.json()) as { personaId?: string; title?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const personaId: PersonaId = isPersonaId(body.personaId)
    ? body.personaId
    : "hitesh";

  const session = await createSession(
    authResult.session.user.id,
    personaId,
    body.title,
  );

  return NextResponse.json({ session }, { status: 201 });
}

/** One-time bulk import from browser localStorage. */
export async function PUT(request: Request) {
  const authResult = await requireSession();
  if ("response" in authResult) {
    return authResult.response;
  }

  let body: { sessions?: MigrateSessionInput[] };
  try {
    body = (await request.json()) as { sessions?: MigrateSessionInput[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.sessions)) {
    return NextResponse.json(
      { error: "`sessions` must be an array." },
      { status: 400 },
    );
  }

  const imported = await migrateSessions(
    authResult.session.user.id,
    body.sessions,
  );

  return NextResponse.json({ imported });
}
