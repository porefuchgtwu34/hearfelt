import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const entry = await db.journalEntry.findUnique({ where: { id } });
    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    if (entry.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db.journalEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[journal delete]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
