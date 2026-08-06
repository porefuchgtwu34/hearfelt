import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const PAGE_SIZE = 6;

function emptyFeed(page = 1) {
  return NextResponse.json({
    posts: [],
    page,
    pageSize: PAGE_SIZE,
    totalPages: 1,
    total: 0,
  });
}

export async function GET(req: Request) {
  if (!process.env.DATABASE_URL) {
    return emptyFeed();
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const category = searchParams.get("category") || undefined;
    const q = searchParams.get("q") || undefined;

    let me = null;
    try {
      me = await getCurrentUser();
    } catch {
      me = null;
    }

    const where: any = {
      AND: [
        category && category !== "all" ? { category } : {},
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    };

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          author: { select: { id: true, username: true, avatarColor: true } },
          _count: { select: { comments: true, likes: true } },
        },
      }),
      db.post.count({ where }),
    ]);

    let likedIds: string[] = [];
    let bookmarkedIds: string[] = [];
    if (me) {
      try {
        const [likes, bookmarks] = await Promise.all([
          db.like.findMany({
            where: { userId: me.id, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true },
          }),
          db.bookmark.findMany({
            where: { userId: me.id, postId: { in: posts.map((p) => p.id) } },
            select: { postId: true },
          }),
        ]);
        likedIds = likes.map((l) => l.postId);
        bookmarkedIds = bookmarks.map((b) => b.postId);
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      posts: posts.map((p) => ({
        ...p,
        liked: likedIds.includes(p.id),
        bookmarked: bookmarkedIds.includes(p.id),
        reactions: {},
        myReactions: { heart: false, hug: false, support: false, insight: false },
      })),
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      total,
    });
  } catch (e) {
    console.error("[posts GET]", e);
    return emptyFeed();
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in to post." }, { status: 401 });

    const { title, content, category, mood } = await req.json();
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json({ error: "Title must be at least 3 characters." }, { status: 400 });
    }
    if (!content || typeof content !== "string" || content.trim().length < 5) {
      return NextResponse.json({ error: "Please write a bit more in your post." }, { status: 400 });
    }
    const validCategories = ["relationship", "self-love", "behaviour", "psychology", "heartbreak"];
    const cat = validCategories.includes(category) ? category : "relationship";

    const post = await db.post.create({
      data: {
        authorId: user.id,
        title: title.trim().slice(0, 140),
        content: content.trim().slice(0, 5000),
        category: cat,
        mood: mood || null,
      },
      include: {
        author: { select: { id: true, username: true, avatarColor: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    return NextResponse.json({
      ...post,
      liked: false,
      bookmarked: false,
      reactions: {},
      myReactions: { heart: false, hug: false, support: false, insight: false },
    });
  } catch (e) {
    console.error("[posts POST]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
