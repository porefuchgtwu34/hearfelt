import { db } from "@/lib/db";

export async function createNotification(opts: {
  userId: string;
  type: string;
  message: string;
  actorId?: string;
  actorUsername?: string;
  postId?: string;
  postTitle?: string;
  conversationId?: string;
}) {
  try {
    await db.notification.create({
      data: {
        userId: opts.userId,
        type: opts.type,
        message: opts.message,
        actorId: opts.actorId,
        actorUsername: opts.actorUsername,
        postId: opts.postId,
        postTitle: opts.postTitle,
        conversationId: opts.conversationId,
      },
    });
  } catch (e) {
    console.error("[notify]", e);
  }
}
