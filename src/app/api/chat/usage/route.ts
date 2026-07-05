import { NextResponse } from "next/server";

import { requireSession } from "@/lib/api/session";
import { getUsageToday } from "@/lib/chat/repository";

export async function GET() {
  const authResult = await requireSession();
  if ("response" in authResult) {
    return authResult.response;
  }

  const usage = await getUsageToday(authResult.session.user.id);
  return NextResponse.json(usage);
}
