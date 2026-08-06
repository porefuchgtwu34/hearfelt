"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Quote as QuoteIcon, RefreshCw, Heart, Brain, Copy, Check, Share2 } from "lucide-react";
import { api } from "@/lib/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type QuoteT = { text: string; author: string; type: string };

export function QuotesView() {
  const [quotes, setQuotes] = useState<QuoteT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "love" | "psychology">("all");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  async function copyQuote(q: QuoteT, i: number) {
    const text = `"${q.text}" — ${q.author}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(i);
      toast.success("Quote copied to clipboard");
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      toast.error("Could not copy.");
    }
  }

  async function shareQuote(q: QuoteT) {
    const text = `"${q.text}" — ${q.author}`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: "A quote from Heartfelt" });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
      }
    } catch {}
  }

  async function load(type: "all" | "love" | "psychology" = "all") {
    setLoading(true);
    try {
      const data = await api<{ quotes: QuoteT[] }>(`/api/quotes?type=${type}&count=12`);
      setQuotes(data.quotes || []);
    } catch (e: any) {
      toast.error(e.message || "Could not load quotes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("all");
  }, []);

  const filters = [
    { key: "all" as const, label: "All", icon: QuoteIcon },
    { key: "love" as const, label: "Love", icon: Heart },
    { key: "psychology" as const, label: "Psychology", icon: Brain },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <QuoteIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Quotes</h1>
            <p className="text-sm text-muted-foreground">Words for the heart and mind</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {filters.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? "default" : "outline"}
              onClick={() => {
                setFilter(f.key);
                load(f.key);
              }}
            >
              <f.icon className="h-3.5 w-3.5 mr-1" />
              {f.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => load(filter)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {quotes.map((q, i) => (
            <Card key={i} className="p-6 border-border/60 hover:border-primary/30 transition-colors">
              <p className="text-base font-serif italic leading-relaxed text-foreground/90">
                &ldquo;{q.text}&rdquo;
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">— {q.author}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyQuote(q, i)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                      copiedIdx === i
                        ? "text-emerald-500 bg-emerald-500/10"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    )}
                    title="Copy quote"
                  >
                    {copiedIdx === i ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => shareQuote(q)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Share quote"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </button>
                  <span
                    className={cn(
                      "ml-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      q.type === "love" ? "cat-relationship" : "cat-psychology"
                    )}
                  >
                    {q.type}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
