"use client";

import { Card } from "@/components/ui/card";
import { Sun } from "lucide-react";
import { affirmationForDate } from "@/lib/affirmations";

export function DailyAffirmationCard() {
  const affirmation = affirmationForDate();
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-primary/5 to-accent/30 animate-fade-up">
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, oklch(0.85 0.12 60 / 0.5), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
            <Sun className="h-4 w-4 text-primary" />
          </span>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Today's affirmation
            </p>
            <p className="text-[11px] text-muted-foreground">{today}</p>
          </div>
        </div>
        <p className="text-lg sm:text-xl font-medium leading-snug text-foreground/90">
          &ldquo;{affirmation.text}&rdquo;
        </p>
        <p className="mt-3 text-xs text-muted-foreground italic">— {affirmation.author}</p>
      </div>
    </Card>
  );
}
