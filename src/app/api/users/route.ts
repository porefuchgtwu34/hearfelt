import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const me = await getCurrentUser();
  const where = {
    AND: [
      me ? { id: { not: me.id } } : {},
      q ? { username: { contains: q } } : {},
    ],
  };
  const users = await db.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      avatarColor: true,
      bio: true,
      createdAt: true,
    },
    orderBy: { username: "asc" },
    take: 50,
  });
  return NextResponse.json({ users });
}
