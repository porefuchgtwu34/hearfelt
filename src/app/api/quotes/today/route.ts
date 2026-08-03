import { NextResponse } from "next/server";
import { LOVE_QUOTES, PSYCHOLOGY_QUOTES } from "@/lib/quotes-data";

export async function GET() {
  const all = [...LOVE_QUOTES, ...PSYCHOLOGY_QUOTES];
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const quote = all[dayOfYear % all.length];
  return NextResponse.json({ quote, dayOfYear });
}
