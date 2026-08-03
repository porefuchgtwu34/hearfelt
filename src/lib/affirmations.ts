// A curated set of gentle daily affirmations for the journal view.
// Selected deterministically by day-of-year so every user sees the same
// affirmation on a given day (a small shared ritual).

export const AFFIRMATIONS: { text: string; author: string }[] = [
  { text: "You are allowed to take up space, exactly as you are.", author: "A reminder for today" },
  { text: "Your feelings are valid, even the ones that are hard to explain.", author: "A reminder for today" },
  { text: "You don't have to earn rest. You are allowed to pause.", author: "A reminder for today" },
  { text: "Healing is not linear. Progress can look like rest, too.", author: "A reminder for today" },
  { text: "You are worthy of love that feels safe and kind.", author: "A reminder for today" },
  { text: "It's okay to outgrow people, places, and versions of yourself.", author: "A reminder for today" },
  { text: "Your boundaries protect your peace. Honour them.", author: "A reminder for today" },
  { text: "You can be a work in progress and still be proud of who you are.", author: "A reminder for today" },
  { text: "Softness is not weakness. It is strength that chooses gentleness.", author: "A reminder for today" },
  { text: "You are not behind. You are on your own timeline.", author: "A reminder for today" },
  { text: "Asking for help is a form of self-respect.", author: "A reminder for today" },
  { text: "You deserve relationships that feel like home.", author: "A reminder for today" },
];

export function getTodaysAffirmation() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];
}
