import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    await requireAdmin();
    const posts = await db.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        author: { select: { id: true, username: true, avatarColor: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    return NextResponse.json({ posts });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED" || e?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    console.error("[admin posts]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });
    await db.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED" || e?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    console.error("[admin delete post]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
