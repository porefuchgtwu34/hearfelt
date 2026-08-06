import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = await req.json();
    if (!["open", "reviewed", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    const updated = await db.report.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("[admin report PATCH]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const report = await db.report.findUnique({ where: { id } });
    if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });

    if (report.targetType === "post") {
      await db.post.deleteMany({ where: { id: report.targetId } });
    } else if (report.targetType === "comment") {
      await db.comment.deleteMany({ where: { id: report.targetId } });
    }
    await db.report.update({ where: { id }, data: { status: "reviewed" } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin report DELETE]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
