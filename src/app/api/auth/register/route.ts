import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { dbRequired, handleRouteError } from "@/lib/api-error";

const registerSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

export async function POST(req: Request) {
  const missing = dbRequired();
  if (missing) return missing;

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { username, email, password } = parsed.data;
    const lowerEmail = email.toLowerCase();

    const existing = await db.user.findFirst({
      where: {
        OR: [{ email: lowerEmail }, { username }],
      },
    });
    if (existing) {
      if (existing.email === lowerEmail) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "That username is already taken." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        username,
        email: lowerEmail,
        passwordHash,
        avatarColor: ["rose", "amber", "violet", "emerald", "pink", "coral"][
          Math.floor(Math.random() * 6)
        ],
      },
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (e) {
    return handleRouteError("register", e);
  }
}
