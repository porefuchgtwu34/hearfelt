import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const comment = await db.comment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    if (comment.authorId !== user.id) {
      return NextResponse.json({ error: "You can only edit your own comments." }, { status: 403 });
    }
    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length < 1) {
      return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
    }
    const updated = await db.comment.update({
      where: { id },
      data: { content: content.trim().slice(0, 1000) },
      include: {
        author: { select: { id: true, username: true, avatarColor: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("[comment edit]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const comment = await db.comment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    if (comment.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await db.comment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[comment delete]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
