import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json({ error: "Please write a short message." }, { status: 400 });
    }
    const me = await getCurrentUser();

    const entry = await db.contactRequest.create({
      data: {
        fromUserId: me?.id ?? null,
        name: name.trim().slice(0, 80),
        email: email.trim().toLowerCase().slice(0, 120),
        subject: (subject || "General enquiry").trim().slice(0, 140),
        message: message.trim().slice(0, 4000),
      },
    });
    return NextResponse.json({ ok: true, id: entry.id });
  } catch (e) {
    console.error("[contact POST]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
