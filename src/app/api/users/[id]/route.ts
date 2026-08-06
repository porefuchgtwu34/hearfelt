import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatarColor: true,
        bio: true,
        createdAt: true,
        _count: { select: { posts: true, comments: true } },
      },
    });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const posts = await db.post.findMany({
      where: { authorId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        _count: { select: { comments: true, likes: true } },
      },
    });

    return NextResponse.json({ user, posts });
  } catch (e) {
    console.error("[user profile]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
