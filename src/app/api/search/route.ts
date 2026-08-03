import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 1) {
    return NextResponse.json({ posts: [], users: [], quotes: [] });
  }

  const [posts, users] = await Promise.all([
    db.post.findMany({
      where: {
        OR: [{ title: { contains: q } }, { content: { contains: q } }],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: { select: { id: true, username: true, avatarColor: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    db.user.findMany({
      where: { username: { contains: q } },
      select: { id: true, username: true, avatarColor: true, bio: true },
      take: 5,
    }),
  ]);

  const { LOVE_QUOTES, PSYCHOLOGY_QUOTES } = await import("@/lib/quotes-data");
  const allQuotes = [...LOVE_QUOTES, ...PSYCHOLOGY_QUOTES];
  const ql = q.toLowerCase();
  const quotes = allQuotes
    .filter(
      (qt) => qt.text.toLowerCase().includes(ql) || qt.author.toLowerCase().includes(ql)
    )
    .slice(0, 4)
    .map((qt, i) => ({ ...qt, id: `q-${i}` }));

  return NextResponse.json({
    posts: posts.map((p) => ({ ...p, liked: false, bookmarked: false })),
    users,
    quotes,
  });
}
