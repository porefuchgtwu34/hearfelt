import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notify";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

    const existing = await db.like.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });
    if (existing) {
      await db.like.delete({ where: { id: existing.id } });
      const count = await db.like.count({ where: { postId } });
      return NextResponse.json({ liked: false, count });
    }
    await db.like.create({ data: { postId, userId: user.id } });
    const count = await db.like.count({ where: { postId } });

    const post = await db.post.findUnique({ where: { id: postId }, select: { authorId: true, title: true } });
    if (post && post.authorId !== user.id) {
      await createNotification({
        userId: post.authorId,
        type: "like",
        actorId: user.id,
        actorUsername: user.username,
        postId,
        postTitle: post.title,
        message: `${user.username} liked your post "${post.title.slice(0, 40)}"`,
      });
    }

    return NextResponse.json({ liked: true, count });
  } catch (e) {
    console.error("[like]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
