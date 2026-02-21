// ——— Stage identity ———
export const STAGES = ['prompt', 'bluffOrTruth', 'reveal'] as const
export type Stage = (typeof STAGES)[number]

export const STAGE_DURATIONS: Record<Stage, number> = {
  prompt: 2800,
  bluffOrTruth: 4200,
  reveal: 2800,
}

// ——— Prompt stage: one prompt per post (post 1, 2, 3) ———
export const PROMPT_STAGE = {
  title: "Today's Prompt",
} as const

/** Prompt text shown for each demo post (index 0, 1, 2). Change these to vary the demo. */
export const DEMO_PROMPTS: [string, string, string] = [
  "What's your most overrated Vegas moment?",
  "What's the one spot you'd never tell tourists about?",
  'Best local spot in town. No tourists, no lines — prove it.',
]

// ——— Demo posts 1, 2, 3: edit here to change what each card shows ———
export type DemoPostData = {
  imageUrl: string
  authorImgUrl: string
  authorName: string
  authorHandle: string
  timeAgo: string
  caption?: string
  /** true = truth, false = bluff */
  isTruth: boolean
}

export const DEMO_POSTS: DemoPostData[] = [
  {
    imageUrl:
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    authorImgUrl:
      'https://cdn.discordapp.com/avatars/598704715966054450/2055fc9a531f89c9ac92927c05f8d4d2.webp?size=160',
    authorName: 'Jimi Vasko',
    authorHandle: 'vasko',
    timeAgo: '2h ago',
    caption: `This happened when I was in Japan and they asked me where I'm from, and I said Vegas, they immediately assumed that I live on the strip and life must always be exciting.`,
    isTruth: true,
  },
  {
    imageUrl: 'https://media.timeout.com/images/106264276/image.jpg',
    authorImgUrl:
      'https://cdn.discordapp.com/avatars/1158152522695987370/6ac329cc526b7d2e0d508b719d86acee.webp?size=160',
    authorName: 'Richies Huynh',
    authorHandle: 'richies',
    timeAgo: '4h ago',
    caption: `I’d never tell tourists about Esther’s Kitchen`,
    isTruth: true,
  },
  {
    imageUrl: 'https://picsum.photos/seed/bluff3/400/500',
    authorImgUrl: 'https://picsum.photos/seed/avatar3/64/64',
    authorName: 'Sam Black',
    authorHandle: 'black',
    timeAgo: '5h ago',
    caption:
      'Best local spot in town. No tourists, no lines — and the slot machine pays out in chicken wings.',
    isTruth: false,
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
