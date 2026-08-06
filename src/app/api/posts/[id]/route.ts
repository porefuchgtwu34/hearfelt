import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const VALID_CATEGORIES = ["relationship", "self-love", "behaviour", "psychology", "heartbreak"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const post = await db.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.authorId !== user.id) {
      return NextResponse.json({ error: "You can only edit your own posts." }, { status: 403 });
    }

    const { title, content, category, mood } = await req.json();
    const data: any = {};

    if (typeof title === "string" && title.trim().length >= 3) {
      data.title = title.trim().slice(0, 140);
    }
    if (typeof content === "string" && content.trim().length >= 5) {
      data.content = content.trim().slice(0, 5000);
    }
    if (typeof category === "string" && VALID_CATEGORIES.includes(category)) {
      data.category = category;
    }
    if (typeof mood === "string" && mood) {
      data.mood = mood;
    } else if (mood === null || mood === "") {
      data.mood = null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const updated = await db.post.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, username: true, avatarColor: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      liked: false,
      bookmarked: false,
      reactions: {},
      myReactions: {},
    });
  } catch (e) {
    console.error("[post edit]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const post = await db.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (post.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await db.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[post delete]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
