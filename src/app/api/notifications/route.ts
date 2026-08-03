import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    const unread = notifications.filter((n) => !n.read).length;
    return NextResponse.json({ notifications, unread });
  } catch (e) {
    console.error("[notifications GET]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    if (body.all) {
      await db.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    } else if (body.id) {
      await db.notification.updateMany({
        where: { id: body.id, userId: user.id },
        data: { read: true },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[notifications PATCH]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
