import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const REASONS = ["spam", "harassment", "harmful", "off-topic", "other"];

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in to report." }, { status: 401 });
    const { targetType, targetId, reason, detail } = await req.json();
    if (!["post", "comment"].includes(targetType)) {
      return NextResponse.json({ error: "Invalid target type." }, { status: 400 });
    }
    if (!targetId) return NextResponse.json({ error: "Missing target." }, { status: 400 });
    if (!REASONS.includes(reason)) {
      return NextResponse.json({ error: "Invalid reason." }, { status: 400 });
    }

    const existing = await db.report.findFirst({
      where: { reporterId: user.id, targetType, targetId, status: "open" },
    });
    if (existing) {
      return NextResponse.json({ error: "You've already reported this. An admin will review it." }, { status: 409 });
    }

    const report = await db.report.create({
      data: {
        reporterId: user.id,
        targetType,
        targetId,
        reason,
        detail: typeof detail === "string" ? detail.trim().slice(0, 500) || null : null,
      },
    });
    return NextResponse.json({ ok: true, id: report.id });
  } catch (e) {
    console.error("[report POST]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
