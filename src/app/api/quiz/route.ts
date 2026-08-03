import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { LOVE_LANGUAGE_QUIZ, scoreLoveLanguage } from "@/lib/quiz-data";

export async function GET() {
  return NextResponse.json({ quiz: LOVE_LANGUAGE_QUIZ });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Please log in to save your result." }, { status: 401 });
    const { answers } = await req.json();
    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid answers." }, { status: 400 });
    }
    const result = scoreLoveLanguage(answers);
    await db.quizResult.create({
      data: {
        userId: user.id,
        quizType: "love-language",
        answers: JSON.stringify(answers),
        result: JSON.stringify(result),
      },
    });
    return NextResponse.json({ result });
  } catch (e) {
    console.error("[quiz POST]", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
