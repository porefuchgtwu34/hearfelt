import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { notify } from "@/lib/notify";

const VALID_EMOJIS = ["heart", "hug", "support", "insight"];
const EMOJI_LABELS: Record<string, string> = {
  heart: "❤️",
  hug: "🤗",
  support: "🙏",
  insight: "💡",
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    const { postId, emoji } = await req.json();
    if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    if (!VALID_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: "Invalid reaction." }, { status: 400 });
    }

    const existing = await db.reaction.findUnique({
      where: { postId_userId_emoji: { postId, userId: user.id, emoji } },
    });
    if (existing) {
      await db.reaction.delete({ where: { id: existing.id } });
      const count = await db.reaction.count({ where: { postId, emoji } });
      return NextResponse.json({ reacted: false, emoji, count });
    }
    await db.reaction.create({ data: { postId, userId: user.id, emoji } });
    const count = await db.reaction.count({ where: { postId, emoji } });

    const post = await db.post.findUnique({ where: { id: postId }, select: { authorId: true, title: true } });
    if (post) {
      await notify({
        userId: post.authorId,
        type: "like",
        actorId: user.id,
        actorUsername: user.username,
        postId,
        postTitle: post.title,
        message: `${user.username} reacted ${EMOJI_LABELS[emoji]} to your post "${post.title.slice(0, 40)}"`,
      });
    }

    return NextResponse.json({ reacted: true, emoji, count });
  } catch (e) {
    console.error("[reaction]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
