// Lightweight, rule-based psychological insight generator.

const MOOD_THEMES: Record<string, { label: string; reflection: string; prompt: string }> = {
  joyful: {
    label: "Joy",
    reflection: "Joy is worth slowing down for. Notice what specifically sparked this feeling — the people, the moment, the small detail.",
    prompt: "What is one tiny thing you could do tomorrow to invite more of this feeling?",
  },
  calm: {
    label: "Calm",
    reflection: "Calm is the nervous system's version of a deep breath. You've found a moment of equilibrium — that's a skill, not luck.",
    prompt: "Which boundary, habit, or pause helped create this calm today?",
  },
  anxious: {
    label: "Anxiety",
    reflection: "Anxiety usually points to something you care about being at risk. Rather than fighting it, get curious: what is it trying to protect?",
    prompt: "If a kind friend heard these thoughts, what would they gently say back?",
  },
  heartbroken: {
    label: "Heartbreak",
    reflection: "Heartbreak is grief for something that mattered — which means you had the courage to care. Healing isn't linear.",
    prompt: "What is one small way you can be tender with yourself today?",
  },
  grateful: {
    label: "Gratitude",
    reflection: "Gratitude rewires attention toward what's present rather than what's missing.",
    prompt: "Who is one person you're grateful for, and what would you want them to know?",
  },
  confused: {
    label: "Confusion",
    reflection: "Confusion is a sign you're at the edge of what you already understand — that's where growth lives.",
    prompt: "What would you do if you didn't need to have the 'right' answer today?",
  },
  hopeful: {
    label: "Hope",
    reflection: "Hope isn't pretending things are fine — it's choosing to act as though they could be.",
    prompt: "What is one small action that matches the future you're hoping for?",
  },
  lonely: {
    label: "Loneliness",
    reflection: "Loneliness isn't always about being alone — it's about feeling unseen. Connection is built in tiny brave moments.",
    prompt: "Who could you send a single honest sentence to today?",
  },
};

export function generateInsight(mood: string, content: string): string {
  const theme = MOOD_THEMES[mood] || MOOD_THEMES.calm;
  return `${theme.reflection}\n\nReflection: ${theme.prompt}`;
}
