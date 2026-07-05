import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api/session";
import {
  deleteSession,
  getSession,
  renameSession,
  saveSessionMessages,
} from "@/lib/chat/repository";
import type { UIMessage } from "ai";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireSession();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { id } = await context.params;
  const session = await getSession(authResult.session.user.id, id);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ session });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireSession();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { id } = await context.params;
  let body: { title?: string; messages?: UIMessage[] };

  try {
    body = (await request.json()) as { title?: string; messages?: UIMessage[] };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.messages) {
    const session = await saveSessionMessages(
      authResult.session.user.id,
      id,
      body.messages,
    );
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }
    return NextResponse.json({ session });
  }

  if (body.title !== undefined) {
    const ok = await renameSession(
      authResult.session.user.id,
      id,
      body.title,
    );
    if (!ok) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }
    const session = await getSession(authResult.session.user.id, id);
    return NextResponse.json({ session });
  }

  return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireSession();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { id } = await context.params;
  const ok = await deleteSession(authResult.session.user.id, id);

  if (!ok) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
