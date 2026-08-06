import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status, adminReply } = await req.json();
    const data: any = {};
    if (typeof status === "string" && ["open", "read", "resolved"].includes(status)) {
      data.status = status;
    }
    if (typeof adminReply === "string") {
      data.adminReply = adminReply.trim().slice(0, 4000) || null;
    }
    const updated = await db.contactRequest.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("[admin inbox patch]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await db.contactRequest.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin inbox delete]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
