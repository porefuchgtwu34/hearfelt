import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const reports = await db.report.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        reporter: { select: { id: true, username: true, avatarColor: true } },
      },
    });

    const postIds = reports.filter((r) => r.targetType === "post").map((r) => r.targetId);
    const commentIds = reports.filter((r) => r.targetType === "comment").map((r) => r.targetId);
    const [posts, comments] = await Promise.all([
      postIds.length
        ? db.post.findMany({
            where: { id: { in: postIds } },
            select: {
              id: true,
              title: true,
              content: true,
              authorId: true,
              author: { select: { username: true, avatarColor: true } },
            },
          })
        : Promise.resolve([]),
      commentIds.length
        ? db.comment.findMany({
            where: { id: { in: commentIds } },
            select: {
              id: true,
              content: true,
              authorId: true,
              author: { select: { username: true, avatarColor: true } },
              postId: true,
            },
          })
        : Promise.resolve([]),
    ]);
    const postMap = new Map(posts.map((p) => [p.id, p]));
    const commentMap = new Map(comments.map((c) => [c.id, c]));

    return NextResponse.json({
      reports: reports.map((r) => ({
        ...r,
        target: r.targetType === "post" ? postMap.get(r.targetId) : commentMap.get(r.targetId),
      })),
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED" || e?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    console.error("[admin reports]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
