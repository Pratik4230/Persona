import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

function getHandler() {
  return toNextJsHandler(getAuth());
}

export async function GET(request: Request) {
  return getHandler().GET(request);
}

export async function POST(request: Request) {
  return getHandler().POST(request);
}

export async function PATCH(request: Request) {
  return getHandler().PATCH(request);
}

export async function PUT(request: Request) {
  return getHandler().PUT(request);
}

export async function DELETE(request: Request) {
  return getHandler().DELETE(request);
}
