import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ journaledToday: true });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const count = await db.journalEntry.count({
      where: {
        userId: user.id,
        createdAt: { gte: startOfToday },
      },
    });

    return NextResponse.json({ journaledToday: count > 0 });
  } catch (e) {
    console.error("[journal today]", e);
    return NextResponse.json({ journaledToday: true, error: "Something went wrong." }, { status: 500 });
  }
}
