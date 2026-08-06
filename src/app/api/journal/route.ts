import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { generateInsight } from "@/lib/insights";
import { dbRequired, handleRouteError } from "@/lib/api-error";

export async function GET() {
  const missing = dbRequired();
  if (missing) return missing;

  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const entries = await db.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ entries });
  } catch (e) {
    return handleRouteError("journal GET", e);
  }
}

export async function POST(req: Request) {
  const missing = dbRequired();
  if (missing) return missing;

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please log in to use your journal." },
        { status: 401 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { mood, title, content } = body;
    if (!content || typeof content !== "string" || content.trim().length < 3) {
      return NextResponse.json(
        { error: "Write a little more to reflect on." },
        { status: 400 }
      );
    }
    const validMoods = [
      "joyful",
      "calm",
      "anxious",
      "heartbroken",
      "grateful",
      "confused",
      "hopeful",
      "lonely",
    ];
    const moodVal = validMoods.includes(mood) ? mood : "calm";

    const insight = generateInsight(moodVal, content);
    const entry = await db.journalEntry.create({
      data: {
        userId: user.id,
        mood: moodVal,
        title: title?.trim()?.slice(0, 120) || null,
        content: content.trim().slice(0, 6000),
        insight,
      },
    });
    return NextResponse.json(entry);
  } catch (e) {
    return handleRouteError("journal POST", e);
  }
}
