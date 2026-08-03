export type LoveLanguage = {
  key: string;
  name: string;
  emoji: string;
  blurb: string;
  strengths: string[];
};

export const LOVE_LANGUAGES: LoveLanguage[] = [
  {
    key: "words",
    name: "Words of Affirmation",
    emoji: "💬",
    blurb: "You feel most loved through spoken and written appreciation. Kind, specific words land deeply for you.",
    strengths: ["Expressive", "Encouraging", "Thoughtful with language"],
  },
  {
    key: "acts",
    name: "Acts of Service",
    emoji: "🤝",
    blurb: "For you, love shows up as effort. When someone lightens your load without being asked, that's fluency in your heart's language.",
    strengths: ["Reliable", "Observant", "Action-oriented"],
  },
  {
    key: "gifts",
    name: "Receiving Gifts",
    emoji: "🎁",
    blurb: "It's never about the price — it's the thought that someone remembered. Tangible tokens are how you store and revisit love.",
    strengths: ["Sentimental", "Attentive", "Memory-keeper"],
  },
  {
    key: "quality",
    name: "Quality Time",
    emoji: "⏳",
    blurb: "Undivided attention is your love currency. Presence — phone down, eyes up — tells you that you matter.",
    strengths: ["Present", "Deep listener", "Values connection"],
  },
  {
    key: "touch",
    name: "Physical Touch",
    emoji: "🤗",
    blurb: "A hug, a hand on the shoulder, sitting close — physical closeness is how safety and affection register for you.",
    strengths: ["Warm", "Affectionate", "Grounding presence"],
  },
];

export const LOVE_LANGUAGE_QUIZ = {
  title: "Love Language Quiz",
  description: "Discover how you most naturally give and receive love.",
  questions: [
    {
      id: 1,
      prompt: "After a long hard day, what would mean the most?",
      options: [
        { text: "A sincere 'I'm proud of you'", lang: "words" },
        { text: "Someone cooking dinner so you don't have to", lang: "acts" },
        { text: "A small thoughtful surprise waiting for you", lang: "gifts" },
        { text: "An evening with no phones, just talking", lang: "quality" },
        { text: "A long hug without needing to explain", lang: "touch" },
      ],
    },
    {
      id: 2,
      prompt: "You feel most appreciated when someone…",
      options: [
        { text: "Writes you a note or texts something specific", lang: "words" },
        { text: "Handles a task you were dreading", lang: "acts" },
        { text: "Gives you something that shows they know you", lang: "gifts" },
        { text: "Clears their schedule to be with you", lang: "quality" },
        { text: "Reaches for your hand in a crowd", lang: "touch" },
      ],
    },
    {
      id: 3,
      prompt: "In a relationship, conflict softens fastest when…",
      options: [
        { text: "They apologise with clear, kind words", lang: "words" },
        { text: "They fix what went wrong practically", lang: "acts" },
        { text: "They bring a small peace offering", lang: "gifts" },
        { text: "They sit down and give you undivided attention", lang: "quality" },
        { text: "They hold you while you both cool down", lang: "touch" },
      ],
    },
    {
      id: 4,
      prompt: "A perfect weekend with someone you love looks like…",
      options: [
        { text: "Deep conversations and shared affirmations", lang: "words" },
        { text: "Getting projects done together", lang: "acts" },
        { text: "Finding little gifts for each other", lang: "gifts" },
        { text: "Unstructured time with no agenda", lang: "quality" },
        { text: "Lots of physical closeness and warmth", lang: "touch" },
      ],
    },
    {
      id: 5,
      prompt: "A friend is going through a tough time. You…",
      options: [
        { text: "Send a long, specific voice note", lang: "words" },
        { text: "Quietly handle a chore for them", lang: "acts" },
        { text: "Drop off their favourite snack", lang: "gifts" },
        { text: "Invite them over with no agenda", lang: "quality" },
        { text: "Sit close and let them lean on you", lang: "touch" },
      ],
    },
  ],
};

export function scoreLoveLanguage(answers: { questionId: number; lang: string }[]) {
  const tally: Record<string, number> = {};
  for (const a of answers) {
    tally[a.lang] = (tally[a.lang] || 0) + 1;
  }
  const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const topKey = ranked[0]?.[0] ?? "quality";
  const top = LOVE_LANGUAGES.find((l) => l.key === topKey)!;
  const breakdown = LOVE_LANGUAGES.map((l) => ({
    ...l,
    score: tally[l.key] || 0,
    percent: Math.round(((tally[l.key] || 0) / Math.max(answers.length, 1)) * 100),
  })).sort((a, b) => b.score - a.score);
  return { primary: top, breakdown };
}
