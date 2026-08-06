import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notify";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await db.comment.findMany({
      where: { postId: id },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, username: true, avatarColor: true } },
      },
    });
    return NextResponse.json({ comments });
  } catch (e) {
    console.error("[comments GET]", e);
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in to comment." }, { status: 401 });
    const { id } = await params;
    const { content } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length < 1) {
      return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
    }
    const post = await db.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

    const comment = await db.comment.create({
      data: {
        postId: id,
        authorId: user.id,
        content: content.trim().slice(0, 1000),
      },
      include: {
        author: { select: { id: true, username: true, avatarColor: true } },
      },
    });

    if (post.authorId !== user.id) {
      try {
        await createNotification({
          userId: post.authorId,
          type: "comment",
          actorId: user.id,
          actorUsername: user.username,
          postId: id,
          postTitle: post.title,
          message: `${user.username} commented on your post "${post.title.slice(0, 40)}"`,
        });
      } catch {}
    }

    return NextResponse.json(comment);
  } catch (e) {
    console.error("[comment POST]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
