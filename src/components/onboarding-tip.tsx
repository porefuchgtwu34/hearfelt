"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TIPS = [
  "Sharing helps. Even one sentence is enough. 💛",
  "Your story might be exactly what someone needs to hear today.",
  "You don't have to have it all figured out to post. Honesty is enough.",
  "Kindness goes both ways — your words could comfort someone tonight.",
];

export function OnboardingTip() {
  const { data: session, status } = useSession();
  const [show, setShow] = useState(false);
  const [tip, setTip] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    const seen = localStorage.getItem("heartfelt-onboarding-tip");
    if (seen) return;
    const t = setTimeout(() => {
      const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
      setTip(randomTip);
      setShow(true);
    }, 2500);
    return () => clearTimeout(t);
  }, [status]);

  function dismiss() {
    setShow(false);
    localStorage.setItem("heartfelt-onboarding-tip", "seen");
  }

  if (!session?.user) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-[90] max-w-xs"
        >
          <div className="glass-card rounded-2xl border border-primary/20 shadow-lg p-4 pr-9 relative">
            <button
              onClick={dismiss}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </span>
              <div>
                <p className="text-xs font-semibold text-primary mb-0.5">Welcome to Heartfelt</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{tip}</p>
                <button
                  onClick={dismiss}
                  className="mt-2 text-xs font-medium text-primary hover:underline"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
