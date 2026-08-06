"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, RotateCcw, Loader2, Share2, Copy, Check } from "lucide-react";
import { api } from "@/lib/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Question = {
  id: number;
  prompt: string;
  options: { text: string; lang: string }[];
};
type QuizData = { title: string; subtitle: string; questions: Question[] };
type Breakdown = {
  key: string;
  name: string;
  emoji: string;
  blurb: string;
  strengths: string[];
  score: number;
  percent: number;
};
type Result = { primary: Breakdown; breakdown: Breakdown[] };

export function QuizView() {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultCopied, setResultCopied] = useState(false);

  useEffect(() => {
    api<{ quiz?: QuizData } & QuizData>("/api/quiz")
      .then((d) => setQuiz((d as any).quiz ?? d))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  function pick(qId: number, lang: string) {
    setAnswers((prev) => ({ ...prev, [qId]: lang }));
    setTimeout(() => {
      if (quiz && current < quiz.questions.length - 1) setCurrent((c) => c + 1);
    }, 180);
  }

  async function finish() {
    if (!quiz) return;
    const arr = Object.entries(answers).map(([qId, lang]) => ({
      questionId: Number(qId),
      lang,
    }));
    if (arr.length < quiz.questions.length) {
      toast.error("Please answer every question.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await api<{ result: Result }>("/api/quiz", {
        method: "POST",
        json: { answers: arr },
      });
      setResult(data.result);
      toast.success("Your love language result is ready!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setAnswers({});
    setCurrent(0);
    setResult(null);
  }

  async function shareResult() {
    if (!result) return;
    const text = `My love language is ${result.primary.name} ${result.primary.emoji}\n\nWhat's yours? Take the quiz on Heartfelt.`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: "My Love Language Result" });
      } else {
        await navigator.clipboard.writeText(text);
        setResultCopied(true);
        toast.success("Result copied to clipboard");
        setTimeout(() => setResultCopied(false), 2000);
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <Skeleton className="h-10 w-56 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">
        Quiz unavailable.
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <Card className="p-8 text-center space-y-4">
          <p className="text-4xl">{result.primary.emoji}</p>
          <h2 className="text-2xl font-semibold">{result.primary.name}</h2>
          <p className="text-muted-foreground">{result.primary.blurb}</p>
          <div className="flex justify-center gap-2 pt-2">
            <Button onClick={shareResult} variant="outline" size="sm">
              {resultCopied ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
              Share
            </Button>
            <Button onClick={reset} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-1" /> Retake
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const q = quiz.questions[current];
  const progress = (Object.keys(answers).length / quiz.questions.length) * 100;
  const allAnswered = Object.keys(answers).length >= quiz.questions.length;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">{quiz.title || "Love Language Quiz"}</h1>
          <p className="text-sm text-muted-foreground">{quiz.subtitle}</p>
        </div>
      </div>

      <Progress value={progress} className="mb-6 h-2" />

      <Card className="p-6 space-y-4">
        <p className="text-xs text-muted-foreground">
          Question {current + 1} of {quiz.questions.length}
        </p>
        <h2 className="text-lg font-medium">{q.prompt}</h2>
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => pick(q.id, opt.lang)}
              className={cn(
                "w-full text-left rounded-lg border p-3 text-sm transition-all",
                answers[q.id] === opt.lang
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border/60 hover:border-primary/30 hover:bg-accent/40"
              )}
            >
              {opt.text}
            </button>
          ))}
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={current === 0}
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          >
            Back
          </Button>
          {current < quiz.questions.length - 1 ? (
            <Button
              size="sm"
              disabled={!answers[q.id]}
              onClick={() => setCurrent((c) => c + 1)}
            >
              Next
            </Button>
          ) : (
            <Button size="sm" disabled={!allAnswered || submitting} onClick={finish}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "See results"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
