import { NextResponse } from "next/server";

import { getAuth } from "@/lib/auth";
import { requireSession } from "@/lib/api/session";

export async function GET() {
  const authResult = await requireSession();
  if ("response" in authResult) {
    return authResult.response;
  }

  const { user } = authResult.session;
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: (user as { bio?: string }).bio ?? "",
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
  });
}

export async function PATCH(request: Request) {
  const authResult = await requireSession();
  if ("response" in authResult) {
    return authResult.response;
  }

  let body: { name?: string; bio?: string; image?: string };
  try {
    body = (await request.json()) as {
      name?: string;
      bio?: string;
      image?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const updated = await getAuth().api.updateUser({
    headers: request.headers,
    body: {
      name: body.name,
      image: body.image,
      bio: body.bio,
    },
  });

  return NextResponse.json({ user: updated });
}
