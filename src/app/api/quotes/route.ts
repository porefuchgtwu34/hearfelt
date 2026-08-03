import { NextResponse } from "next/server";
import { LOVE_QUOTES, PSYCHOLOGY_QUOTES } from "@/lib/quotes-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";
  const count = Math.min(20, Math.max(1, parseInt(searchParams.get("count") || "6", 10)));

  let pool = [...LOVE_QUOTES, ...PSYCHOLOGY_QUOTES];
  if (type === "love") pool = LOVE_QUOTES;
  if (type === "psychology") pool = PSYCHOLOGY_QUOTES;

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return NextResponse.json({ quotes: pool.slice(0, count) });
}
