// ——— Stage identity ———
export const STAGES = ['prompt', 'bluffOrTruth', 'reveal'] as const
export type Stage = (typeof STAGES)[number]

export const STAGE_DURATIONS: Record<Stage, number> = {
  prompt: 2400,
  bluffOrTruth: 4200,
  reveal: 2800,
}

// ——— Prompt stage: one prompt per post (post 1, 2, 3) ———
export const PROMPT_STAGE = {
  title: "Today's Prompt",
} as const

/** Prompt text shown for each demo post (index 0, 1, 2). Change these to vary the demo. */
export const DEMO_PROMPTS: [string, string, string] = [
  "What's your most overrated Vegas moment? Or your best local secret.",
  "What's the one spot you'd never tell tourists about?",
  "Best local spot in town. No tourists, no lines — prove it.",
]

// ——— Demo posts 1, 2, 3: edit here to change what each card shows ———
export type DemoPostData = {
  imageUrl: string
  authorName: string
  authorHandle: string
  timeAgo: string
  claim: string
}

export const DEMO_POSTS: DemoPostData[] = [
  {
    imageUrl: 'https://picsum.photos/seed/bluff1/400/500',
    authorName: 'Jimi Vasko',
    authorHandle: 'vasko',
    timeAgo: '2h ago',
    claim: 'I had breakfast at the same diner the Rat Pack used to go to. Frank left me his napkin.',
  },
  {
    imageUrl: 'https://picsum.photos/seed/bluff2/400/500',
    authorName: 'Richies Huynh',
    authorHandle: 'richies',
    timeAgo: '4h ago',
    claim: 'The Bellagio fountains are run by one guy with a garden hose. I’ve seen him.',
  },
  {
    imageUrl: 'https://picsum.photos/seed/bluff3/400/500',
    authorName: 'Sam Black',
    authorHandle: 'black',
    timeAgo: '5h ago',
    claim: 'Best local spot in town. No tourists, no lines — and the slot machine pays out in chicken wings.',
  },
]

// ——— Bluff or Truth stage ———
export const BLUFF_OR_TRUTH_STAGE = {
  truthLabel: 'Truth',
  bluffLabel: 'Bluff',
  swipeLeftLabel: '← Bluff',
  swipeRightLabel: 'Truth →',
  swipeHint: 'swipe to vote',
  bluffButton: 'Bluff',
  truthButton: 'Truth',
} as const

// ——— Reveal stage ———
export const REVEAL_STAGE = {
  prefix: 'It was',
  truthLabel: 'Truth',
  bluffLabel: 'Bluff',
  chipsLabel: 'chips',
} as const

// ——— Game / animation ———
export const CHIPS_WIN = 50
export const CHIPS_LOSE = 25
export const SWIPE_THRESHOLD = 65

export const FLYOUT_DURATION = 0.26
export const FLYOUT_EASE = [0.4, 0, 1, 1] as const
export const SNAP_SPRING = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 38,
}
