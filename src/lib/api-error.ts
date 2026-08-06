import { NextResponse } from "next/server";

export function dbRequired() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }
  return null;
}

export function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(scope: string, e: unknown) {
  console.error(`[${scope}]`, e);
  if (e instanceof Error) {
    if (e.message === "UNAUTHORIZED") return jsonError("Unauthorized", 401);
    if (e.message === "FORBIDDEN") return jsonError("Forbidden", 403);
  }
  return jsonError("Something went wrong.", 500);
}
