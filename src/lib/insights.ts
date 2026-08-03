const MOOD_THEMES: Record<string, { label: string; reflection: string; prompt: string }> = {
  joyful: {
    label: "Joy",
    reflection: "Joy is worth slowing down for. Notice what specifically sparked this feeling — the people, the moment, the small detail. Naming the source of joy trains your brain to spot it more often.",
    prompt: "What is one tiny thing you could do tomorrow to invite more of this feeling?",
  },
  calm: {
    label: "Calm",
    reflection: "Calm is the nervous system's version of a deep breath. You've found a moment of equilibrium — that's a skill, not luck. Notice what helped you arrive here so you can return to it.",
    prompt: "Which boundary, habit, or pause helped create this calm today?",
  },
  anxious: {
    label: "Anxiety",
    reflection: "Anxiety usually points to something you care about being at risk. Rather than fighting it, get curious: what is it trying to protect? Naming the fear often shrinks it.",
    prompt: "If a kind friend heard these thoughts, what would they gently say back?",
  },
  heartbroken: {
    label: "Heartbreak",
    reflection: "Heartbreak is grief for something that mattered — which means you had the courage to care. Healing isn't linear; some days will ache more than others, and that's part of the process, not a failure.",
    prompt: "What is one small way you can be tender with yourself today?",
  },
  grateful: {
    label: "Gratitude",
    reflection: "Gratitude rewires attention toward what's present rather than what's missing. The feeling deepens when you connect it to a person — consider telling them, even briefly.",
    prompt: "Who is one person you're grateful for, and what would you want them to know?",
  },
  confused: {
    label: "Confusion",
    reflection: "Confusion is a sign you're at the edge of what you already understand — that's where growth lives. You don't need the whole map; you only need the next honest step.",
    prompt: "What would you do if you didn't need to have the 'right' answer today?",
  },
  hopeful: {
    label: "Hope",
    reflection: "Hope isn't pretending things are fine — it's choosing to act as though they could be. Hold this feeling loosely and let it point you toward one concrete, doable thing.",
    prompt: "What is one small action that matches the future you're hoping for?",
  },
  lonely: {
    label: "Loneliness",
    reflection: "Loneliness isn't always about being alone — it's about feeling unseen. Reaching out, even with a small message, can interrupt the loop. Connection is built in tiny brave moments.",
    prompt: "Who could you send a single honest sentence to today?",
  },
};

const KEYWORD_CUES: { words: string[]; insight: string }[] = [
  { words: ["anxious", "worried", "panic", "overwhelm", "stress"], insight: "When thoughts race, ground yourself in the body first — five things you see, four you can touch, three you hear. The mind follows the senses back to the present." },
  { words: ["jealous", "envy", "comparison", "not enough"], insight: "Comparison shrinks your story to fit someone else's highlight reel. Your worth isn't a ranking — it's a fact that needs no evidence." },
  { words: ["argument", "fight", "conflict", "angry", "frustrated"], insight: "In conflict, the loudest voice rarely carries the real need. Beneath anger there's often a value asking to be honoured. Try naming the need, not just the complaint." },
  { words: ["ghost", "ignored", "left on read", "rejected"], insight: "Being left without closure is one of the hardest human experiences. Remember that someone's inability to communicate is about them, not your worth." },
  { words: ["love", "in love", "crush", "feelings"], insight: "Early love amplifies everything — that's chemistry, not destiny. Enjoy the rush, but let time tell you whether your values align beneath the spark." },
  { words: ["tired", "exhausted", "burnt", "burnout", "drained"], insight: "Exhaustion is information, not weakness. Rest isn't a reward you earn — it's a requirement your body is asking for directly. What would rest look like today?" },
];

export function generateInsight(mood: string, content: string): string {
  const lower = content.toLowerCase();
  const cue = KEYWORD_CUES.find((c) => c.words.some((w) => lower.includes(w)));
  const theme = MOOD_THEMES[mood] ?? MOOD_THEMES.calm;
  if (cue) {
    return `${cue.insight}\n\n${theme.reflection}\n\nReflect: ${theme.prompt}`;
  }
  return `${theme.reflection}\n\nReflect: ${theme.prompt}`;
}

export function moodLabel(mood: string): string {
  return MOOD_THEMES[mood]?.label ?? mood;
}
