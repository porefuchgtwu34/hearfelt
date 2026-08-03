"use client";

import { Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t mt-auto">
      <div className="mx-auto max-w-5xl px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary fill-primary/30" />
          <span>Heartfelt — a space for honest connection</span>
        </div>
        <p className="text-xs">Love, relationships & psychology community</p>
      </div>
    </footer>
  );
}
