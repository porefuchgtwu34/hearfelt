import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const conversation = await db.conversation.findUnique({ where: { id } });
    if (!conversation) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    if (conversation.userAId !== user.id && conversation.userBId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    await db.message.updateMany({
      where: { conversationId: id, receiverId: user.id, read: false },
      data: { read: true },
    });

    const otherId = conversation.userAId === user.id ? conversation.userBId : conversation.userAId;
    const other = await db.user.findUnique({
      where: { id: otherId },
      select: { id: true, username: true, avatarColor: true },
    });

    return NextResponse.json({ messages, other, conversationId: id });
  } catch (e) {
    console.error("[messages id GET]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
