// Curated "couples quiz" question bank. No AI — all hand-written,
// designed to surface honest conversation rather than gotcha facts.
// Two play modes:
//   • "About you"  : I answer about my partner; they grade my answers.
//   • "Pick one"   : both partners independently pick an option, we
//                    compare and reveal matches.

export const QUIZ_PACKS = [
  {
    id: 'firsts',
    title: 'Our Firsts',
    subtitle: 'Tiny milestones that started everything.',
    accent: 'terracotta',
    questions: [
      { id: 'q1', text: 'Where did we have our first proper conversation?' },
      { id: 'q2', text: 'What was I wearing the day we met?' },
      { id: 'q3', text: 'Who said "I love you" first — and was it on purpose?' },
      { id: 'q4', text: 'What was the first song we both agreed on?' },
      { id: 'q5', text: 'Where was our first trip together?' },
    ],
  },
  {
    id: 'tiny-things',
    title: 'The Tiny Things',
    subtitle: 'The details only you would notice.',
    accent: 'sage',
    questions: [
      { id: 'q1', text: 'What\u2019s the one snack I always restock?' },
      { id: 'q2', text: 'Which side of the bed am I on, and why?' },
      { id: 'q3', text: 'What sound do I make when I\u2019m concentrating?' },
      { id: 'q4', text: 'What\u2019s my comfort meal on a bad day?' },
      { id: 'q5', text: 'Which photo of us is my favourite, and where is it?' },
    ],
  },
  {
    id: 'big-picture',
    title: 'The Big Picture',
    subtitle: 'Where we\u2019re heading, together.',
    accent: 'honey',
    questions: [
      { id: 'q1', text: 'Where do I see us living five years from now?' },
      { id: 'q2', text: 'What dream of mine do I keep coming back to?' },
      { id: 'q3', text: 'What\u2019s my biggest worry about us right now?' },
      { id: 'q4', text: 'Which of my habits do I most want to change?' },
      { id: 'q5', text: 'What would I name a pet we adopted tomorrow?' },
    ],
  },
  {
    id: 'rituals',
    title: 'Our Rituals',
    subtitle: 'The little ceremonies that hold us together.',
    accent: 'terracotta',
    questions: [
      { id: 'q1', text: 'What\u2019s our unspoken Sunday tradition?' },
      { id: 'q2', text: 'What\u2019s the phrase only we use?' },
      { id: 'q3', text: 'What\u2019s the first thing I do when I get home?' },
      { id: 'q4', text: 'How do I like to be apologised to?' },
      { id: 'q5', text: 'What\u2019s the gesture that always means "I love you" without words?' },
    ],
  },
];

// "Pick one" prompts — both partners pick A or B, then compare.
export const PICK_ONE_PROMPTS = [
  { id: 'p1', prompt: 'Saturday night feels more like…', a: 'A loud dinner with friends', b: 'A quiet movie at home' },
  { id: 'p2', prompt: 'Better birthday gift…', a: 'Something handmade', b: 'Something we\u2019ve secretly wanted for months' },
  { id: 'p3', prompt: 'Dream weekend…', a: 'Mountains and silence', b: 'Coastline and chaos' },
  { id: 'p4', prompt: 'Better way to apologise…', a: 'A long honest letter', b: 'A meal cooked from scratch' },
  { id: 'p5', prompt: 'Better morning…', a: 'Slow and unhurried', b: 'Sunrise walk before anyone wakes' },
  { id: 'p6', prompt: 'Future home…', a: 'A small place in a big city', b: 'A bigger place somewhere quiet' },
  { id: 'p7', prompt: 'Travel style…', a: 'Plan every hour', b: 'Show up and figure it out' },
  { id: 'p8', prompt: 'On a tough day, I need…', a: 'Space and quiet', b: 'You, close, no questions' },
];
