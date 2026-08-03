import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const PAGE_SIZE = 6;
const VALID_EMOJIS = ["heart", "hug", "support", "insight"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") || undefined;
  const saved = searchParams.get("saved") === "1";
  const forMe = searchParams.get("forMe") === "1";

  const me = await getCurrentUser();

  let forMeMood: string | null = null;
  if (forMe && me) {
    const latest = await db.journalEntry.findFirst({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      select: { mood: true },
    });
    forMeMood = latest?.mood || null;
  }

  if (saved) {
    if (!me) {
      return NextResponse.json({ posts: [], page: 1, pageSize: PAGE_SIZE, totalPages: 1, total: 0 });
    }
    const bookmarks = await db.bookmark.findMany({
      where: { userId: me.id },
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
    const posts = bookmarks.map((b) => b.post);
    return NextResponse.json({
      posts: posts.map((p) => ({ ...p, liked: false, bookmarked: true })),
      page: 1,
      pageSize: PAGE_SIZE,
      totalPages: 1,
      total: posts.length,
    });
  }

  const where = {
    AND: [
      category && category !== "all" ? { category } : {},
      q ? { OR: [{ title: { contains: q } }, { content: { contains: q } }] } : {},
    ],
  };

  const [allPosts, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: forMeMood ? 0 : (page - 1) * PAGE_SIZE,
      take: forMeMood ? PAGE_SIZE * 4 : PAGE_SIZE,
      include: {
        author: { select: { id: true, username: true, avatarColor: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    db.post.count({ where }),
  ]);

  const posts = forMeMood
    ? [...allPosts]
        .sort((a, b) => {
          const aMatch = a.mood === forMeMood ? 1 : 0;
          const bMatch = b.mood === forMeMood ? 1 : 0;
          if (aMatch !== bMatch) return bMatch - aMatch;
          return b.createdAt.getTime() - a.createdAt.getTime();
        })
        .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : allPosts;

  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  let myReactions: { postId: string; emoji: string }[] = [];
  if (me) {
    const postIds = posts.map((p) => p.id);
    [likedIds, bookmarkedIds, myReactions] = await Promise.all([
      db.like
        .findMany({ where: { userId: me.id, postId: { in: postIds } }, select: { postId: true } })
        .then((r) => r.map((l) => l.postId)),
      db.bookmark
        .findMany({ where: { userId: me.id, postId: { in: postIds } }, select: { postId: true } })
        .then((r) => r.map((b) => b.postId)),
      db.reaction.findMany({
        where: { userId: me.id, postId: { in: postIds } },
        select: { postId: true, emoji: true },
      }),
    ]);
  }

  const reactionCounts = await db.reaction.groupBy({
    by: ["postId", "emoji"],
    where: { postId: { in: posts.map((p) => p.id) } },
    _count: true,
  });
  const reactionMap = new Map<string, Record<string, number>>();
  for (const r of reactionCounts) {
    if (!reactionMap.has(r.postId)) reactionMap.set(r.postId, {});
    reactionMap.get(r.postId)![r.emoji] = r._count;
  }
  const myReactionSet = new Set(myReactions.map((r) => `${r.postId}:${r.emoji}`));

  return NextResponse.json({
    posts: posts.map((p) => ({
      ...p,
      liked: likedIds.includes(p.id),
      bookmarked: bookmarkedIds.includes(p.id),
      reactions: reactionMap.get(p.id) || {},
      myReactions: VALID_EMOJIS.reduce((acc, emoji) => {
        acc[emoji] = myReactionSet.has(`${p.id}:${emoji}`);
        return acc;
      }, {} as Record<string, boolean>),
    })),
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
    forMeMood,
  });
}

export async function POST(req: Request) {
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
