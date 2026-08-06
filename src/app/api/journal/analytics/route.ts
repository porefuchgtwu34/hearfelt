import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const entries = await db.journalEntry.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: since },
      },
      select: { mood: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const days: { date: string; label: string; counts: Record<string, number> }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
      days.push({ date: key, label, counts: {} });
    }
    const dayMap = new Map(days.map((d) => [d.date, d]));

    for (const e of entries) {
      const key = e.createdAt.toISOString().slice(0, 10);
      const day = dayMap.get(key);
      if (day) {
        day.counts[e.mood] = (day.counts[e.mood] || 0) + 1;
      }
    }

    const moods = [
      "joyful",
      "calm",
      "grateful",
      "hopeful",
      "anxious",
      "confused",
      "lonely",
      "heartbroken",
    ];
    const series = days.map((d) => ({
      date: d.date,
      label: d.label,
      ...Object.fromEntries(moods.map((m) => [m, d.counts[m] || 0])),
      total: Object.values(d.counts).reduce((a, b) => a + b, 0),
    }));

    return NextResponse.json({ series, moods });
  } catch (e) {
    console.error("[journal analytics]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
