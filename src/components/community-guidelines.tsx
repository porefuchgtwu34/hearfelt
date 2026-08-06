"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Heart, Shield, MessageCircle, Lock, Users, Sparkles } from "lucide-react";

const GUIDELINES = [
  {
    icon: Heart,
    title: "Lead with kindness",
    body: "Speak to others the way you'd want to be spoken to in your most vulnerable moment. Empathy first, always.",
  },
  {
    icon: MessageCircle,
    title: "Advice, not diagnosis",
    body: "Share what's worked for you, not what someone 'should' do. We're peers, not professionals. Avoid clinical labels.",
  },
  {
    icon: Lock,
    title: "Respect privacy",
    body: "What's shared here stays here. Don't repost someone's story elsewhere. Don't ask for personal contact details.",
  },
  {
    icon: Users,
    title: "No harassment or hate",
    body: "Zero tolerance for bullying, hate speech, or unsolicited romantic advances. Reports are reviewed by our admins.",
  },
  {
    icon: Shield,
    title: "Safety first",
    body: "If you're in crisis, please contact a professional or emergency line. Heartfelt is a complement to therapy, not a replacement.",
  },
  {
    icon: Sparkles,
    title: "Show up authentically",
    body: "You don't need to have it all figured out. Imperfect, honest, and present is exactly enough.",
  },
];

export function CommunityGuidelines({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-card max-h-[85vh] overflow-y-auto fancy-scroll">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          </div>
          <DialogTitle className="text-xl">Our community guidelines</DialogTitle>
          <DialogDescription>
            A few gentle agreements that keep Heartfelt a safe, warm space for everyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {GUIDELINES.map((g, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-3.5 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <g.icon className="h-4.5 w-4.5 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{g.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{g.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-primary/5 border border-primary/15 p-3.5 text-center">
          <p className="text-xs text-muted-foreground">
            By being here, you agree to these guidelines. Violations may result in content removal or account action.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
