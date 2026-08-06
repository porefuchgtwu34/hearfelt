import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { resetStore } from "@/app/api/auth/forgot/route";

const schema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(6).max(72),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { email, token, password } = parsed.data;
    const lower = email.toLowerCase().trim();
    const entry = resetStore.get(lower);
    if (!entry || entry.token !== token || entry.expires < Date.now()) {
      return NextResponse.json(
        { error: "Reset link is invalid or has expired." },
        { status: 400 }
      );
    }
    const user = await db.user.findUnique({ where: { email: lower } });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.update({ where: { id: user.id }, data: { passwordHash } });
    resetStore.delete(lower);
    return NextResponse.json({
      ok: true,
      message: "Your password has been reset. You can now log in.",
    });
  } catch (e) {
    console.error("[reset-password]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
