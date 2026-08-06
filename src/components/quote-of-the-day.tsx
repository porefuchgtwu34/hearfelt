"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Quote as QuoteIcon, Copy, Check, Share2, Calendar } from "lucide-react";
import { api } from "@/lib/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type QuoteT = { text: string; author: string; type: string };

export function QuoteOfTheDay() {
  const [quote, setQuote] = useState<QuoteT | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api<{ quote: QuoteT }>("/api/quotes/today")
      .then((d) => setQuote(d.quote))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function copyQuote() {
    if (!quote) return;
    const text = `"${quote.text}" — ${quote.author}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Quote copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy.");
    }
  }

  async function shareQuote() {
    if (!quote) return;
    const text = `"${quote.text}" — ${quote.author}\n\nQuote of the Day from Heartfelt`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: "Quote of the Day" });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      }
    } catch {}
  }

  if (loading) {
    return (
      <Card className="p-6 border-border/60">
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-2/3 mb-4" />
        <Skeleton className="h-4 w-24" />
      </Card>
    );
  }

  if (!quote) return null;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-accent/20 to-primary/5 animate-fade-up">
      <span
        className="pointer-events-none absolute -top-2 right-4 text-8xl font-serif leading-none text-primary/10"
        aria-hidden
      >
        &rdquo;
      </span>

      <div className="relative p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <QuoteIcon className="h-4 w-4 text-primary" />
          </span>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">Quote of the day</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {today}
            </p>
          </div>
        </div>

        <p className="text-lg font-serif italic leading-relaxed text-foreground/90">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="mt-3 text-sm font-semibold">— {quote.author}</p>

        <div className="mt-4 flex items-center gap-1.5">
          <button
            onClick={copyQuote}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              copied
                ? "text-emerald-500 bg-emerald-500/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            )}
            title="Copy quote"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={shareQuote}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Share quote"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <span
            className={cn(
              "ml-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              quote.type === "love" ? "cat-relationship" : "cat-psychology"
            )}
          >
            {quote.type}
          </span>
        </div>
      </div>
    </Card>
  );
}
