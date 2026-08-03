import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const VALID_COLORS = ["rose", "amber", "violet", "emerald", "pink", "coral"];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatarColor: user.avatarColor,
      },
    });
  } catch (e) {
    console.error("[me GET]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { bio, avatarColor } = await req.json();

    const data: any = {};
    if (typeof bio === "string") {
      data.bio = bio.trim().slice(0, 200) || null;
    }
    if (typeof avatarColor === "string" && VALID_COLORS.includes(avatarColor)) {
      data.avatarColor = avatarColor;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data,
      select: { id: true, username: true, bio: true, avatarColor: true },
    });
    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error("[me PATCH]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
