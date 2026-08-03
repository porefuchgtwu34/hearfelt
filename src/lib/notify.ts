import { db } from "@/lib/db";

export async function notify(params: {
  userId: string;
  type: "like" | "comment" | "message" | "admin";
  actorId?: string;
  actorUsername?: string;
  postId?: string;
  postTitle?: string;
  conversationId?: string;
  message: string;
}) {
  try {
    if (params.actorId && params.actorId === params.userId) return;
    await db.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        actorId: params.actorId ?? null,
        actorUsername: params.actorUsername ?? null,
        postId: params.postId ?? null,
        postTitle: params.postTitle ?? null,
        conversationId: params.conversationId ?? null,
        message: params.message,
      },
    });
  } catch (e) {
    console.error("[notify]", e);
  }
}
