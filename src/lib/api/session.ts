import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getAuth, type Session } from "@/lib/auth";

export async function requireSession(): Promise<
  { session: Session } | { response: NextResponse }
> {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session };
}
