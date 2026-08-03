export type Quote = {
  text: string;
  author: string;
  type: "love" | "psychology";
};

export const LOVE_QUOTES: Quote[] = [
  { text: "Love is composed of a single soul inhabiting two bodies.", author: "Aristotle", type: "love" },
  { text: "We are most alive when we're in love.", author: "John Updike", type: "love" },
  { text: "The best thing to hold onto in life is each other.", author: "Audrey Hepburn", type: "love" },
  { text: "Where there is love there is life.", author: "Mahatma Gandhi", type: "love" },
  { text: "To love and be loved is to feel the sun from both sides.", author: "David Viscott", type: "love" },
  { text: "Love does not consist of gazing at each other, but in looking outward together in the same direction.", author: "Antoine de Saint-Exupéry", type: "love" },
  { text: "The greatest happiness of life is the conviction that we are loved.", author: "Victor Hugo", type: "love" },
  { text: "We accept the love we think we deserve.", author: "Stephen Chbosky", type: "love" },
  { text: "Love recognizes no barriers.", author: "Maya Angelou", type: "love" },
  { text: "A loving heart is the truest wisdom.", author: "Charles Dickens", type: "love" },
  { text: "The art of love is largely the art of persistence.", author: "Albert Ellis", type: "love" },
  { text: "Love is when the other person's happiness is more important than your own.", author: "H. Jackson Brown Jr.", type: "love" },
];

export const PSYCHOLOGY_QUOTES: Quote[] = [
  { text: "Between stimulus and response there is a space. In that space is our power to choose our response.", author: "Viktor E. Frankl", type: "psychology" },
  { text: "The curious paradox is that when I accept myself just as I am, then I can change.", author: "Carl Rogers", type: "psychology" },
  { text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung", type: "psychology" },
  { text: "What you resist, persists.", author: "Carl Jung", type: "psychology" },
  { text: "We cannot solve our problems with the same thinking we used when we created them.", author: "Albert Einstein", type: "psychology" },
  { text: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung", type: "psychology" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama", type: "psychology" },
  { text: "Everything can be taken from a man but one thing: the last of human freedoms — to choose one's attitude.", author: "Viktor E. Frankl", type: "psychology" },
  { text: "The good life is a process, not a state of being. It is a direction, not a destination.", author: "Carl Rogers", type: "psychology" },
  { text: "Knowing your own darkness is the best method for dealing with the darknesses of other people.", author: "Carl Jung", type: "psychology" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson", type: "psychology" },
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman", type: "psychology" },
];
