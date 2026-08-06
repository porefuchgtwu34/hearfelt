import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    await requireAdmin();
    const inbox = await db.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        fromUser: { select: { id: true, username: true, avatarColor: true } },
      },
    });
    return NextResponse.json({ inbox });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED" || e?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    console.error("[admin inbox]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
