import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createNotification } from "@/lib/notify";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversations = await db.conversation.findMany({
      where: {
        OR: [{ userAId: user.id }, { userBId: user.id }],
      },
      include: {
        userA: { select: { id: true, username: true, avatarColor: true } },
        userB: { select: { id: true, username: true, avatarColor: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const unreadCounts = await db.message.groupBy({
      by: ["conversationId"],
      where: { receiverId: user.id, read: false },
      _count: true,
    });
    const unreadMap = new Map(unreadCounts.map((u) => [u.conversationId, u._count]));

    const result = conversations.map((c) => {
      const other = c.userAId === user.id ? c.userB : c.userA;
      return {
        id: c.id,
        other,
        lastMessage: c.messages[0] ?? null,
        unread: unreadMap.get(c.id) ?? 0,
        updatedAt: c.updatedAt,
      };
    });

    return NextResponse.json({ conversations: result });
  } catch (e) {
    console.error("[messages GET]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetIdentifier, content } = await req.json();
    if (!targetIdentifier) {
      return NextResponse.json({ error: "Who would you like to message?" }, { status: 400 });
    }
    const target = await db.user.findFirst({
      where: {
        OR: [{ id: targetIdentifier }, { username: { equals: String(targetIdentifier) } }],
      },
      select: { id: true, username: true, avatarColor: true },
    });
    if (!target) return NextResponse.json({ error: "No user found with that username." }, { status: 404 });
    if (target.id === user.id) return NextResponse.json({ error: "You can't message yourself." }, { status: 400 });

    const [a, b] = [user.id, target.id].sort();
    let conversation = await db.conversation.findUnique({
      where: { userAId_userBId: { userAId: a, userBId: b } },
    });
    if (!conversation) {
      conversation = await db.conversation.create({ data: { userAId: a, userBId: b } });
    }

    if (content && typeof content === "string" && content.trim()) {
      await db.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          receiverId: target.id,
          content: content.trim().slice(0, 2000),
        },
      });
      await db.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
      await createNotification({
        userId: target.id,
        type: "message",
        actorId: user.id,
        actorUsername: user.username,
        conversationId: conversation.id,
        message: `${user.username} sent you a message`,
      });
    }

    return NextResponse.json({ conversationId: conversation.id, other: target });
  } catch (e) {
    console.error("[messages POST]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
