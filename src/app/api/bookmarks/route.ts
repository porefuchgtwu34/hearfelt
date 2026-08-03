import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

    const existing = await db.bookmark.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });
    if (existing) {
      await db.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ bookmarked: false });
    }
    await db.bookmark.create({ data: { postId, userId: user.id } });
    return NextResponse.json({ bookmarked: true });
  } catch (e) {
    console.error("[bookmark]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const bookmarks = await db.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: { select: { id: true, username: true, avatarColor: true } },
            _count: { select: { comments: true, likes: true } },
          },
        },
      },
    });
    return NextResponse.json({
      posts: bookmarks.map((b) => ({ ...b.post, liked: false, bookmarked: true })),
    });
  } catch (e) {
    console.error("[bookmarks GET]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
