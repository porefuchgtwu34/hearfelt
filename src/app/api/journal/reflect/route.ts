import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { generateInsight } from "@/lib/insights";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

    const { entryId } = await req.json();
    if (!entryId) return NextResponse.json({ error: "Missing entryId." }, { status: 400 });

    const entry = await db.journalEntry.findUnique({ where: { id: entryId } });
    if (!entry) return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    if (entry.userId !== user.id) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    if (entry.aiReflection) {
      return NextResponse.json({ reflection: entry.aiReflection, cached: true });
    }

    // Rule-based fallback (no external LLM dependency required)
    const reflection = generateInsight(entry.mood, entry.content);

    await db.journalEntry.update({
      where: { id: entryId },
      data: { aiReflection: reflection },
    });

    return NextResponse.json({ reflection, cached: false });
  } catch (e) {
    console.error("[journal reflect]", e);
    return NextResponse.json(
      { error: "Something went wrong generating your reflection." },
      { status: 500 }
    );
  }
}
