"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Flag, Loader2, Send } from "lucide-react";
import { api } from "@/lib/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const REASONS = [
  { key: "spam", label: "Spam or repetitive", emoji: "📵" },
  { key: "harassment", label: "Harassment or unkindness", emoji: "😞" },
  { key: "harmful", label: "Harmful or dangerous", emoji: "⚠️" },
  { key: "off-topic", label: "Off-topic for this space", emoji: "🔍" },
  { key: "other", label: "Something else", emoji: "✏️" },
];

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  targetType: "post" | "comment";
  targetId: string;
}) {
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!reason) {
      toast.error("Please choose a reason.");
      return;
    }
    setSubmitting(true);
    try {
      await api("/api/reports", {
        method: "POST",
        json: { targetType, targetId, reason, detail },
      });
      toast.success("Thank you — an admin will review this shortly.");
      onOpenChange(false);
      setReason(null);
      setDetail("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10">
            <Flag className="h-5 w-5 text-amber-600" />
          </div>
          <DialogTitle>Report this {targetType}</DialogTitle>
          <DialogDescription>
            Help us keep Heartfelt kind and safe. Reports are reviewed by our admins.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Why are you reporting?</Label>
            <div className="space-y-1.5">
              {REASONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setReason(r.key)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-all",
                    reason === r.key
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/60 hover:border-primary/30 hover:bg-accent/40"
                  )}
                >
                  <span className="text-base">{r.emoji}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="r-detail" className="text-xs font-medium">
              Additional detail (optional)
            </Label>
            <Textarea
              id="r-detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Anything that helps us understand the issue…"
              className="resize-none"
            />
            <p className="text-right text-[11px] text-muted-foreground">{detail.length}/500</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={submitting}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1.5" /> Submit report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
