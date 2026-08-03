import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";

const resetStore = new Map<string, { token: string; expires: number }>();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const lower = email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email: lower } });
    if (user) {
      const token = crypto.randomBytes(24).toString("hex");
      resetStore.set(lower, { token, expires: Date.now() + 1000 * 60 * 30 });
      console.log(`[password-reset] token for ${lower}: ${token}`);
    }
    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link has been generated.",
      devToken: user ? resetStore.get(lower)?.token : undefined,
      devEmail: user ? lower : undefined,
    });
  } catch (e) {
    console.error("[forgot]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export { resetStore };
