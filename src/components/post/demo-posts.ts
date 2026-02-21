import type { DemoPost } from '.'

/**
 * Demo posts for the Circle Feed (notes: Vegas theme, 1 photo, 1 claim, optional caption).
 * Vote count shown; breakdown hidden until reveal. Tells: "Too perfect", "No receipts", "Tourist energy".
 */
export const DEMO_POSTS: DemoPost[] = [
  {
    id: '1',
    authorName: 'Jordan Reed',
    authorHandle: 'jreed',
    timeAgo: '2h ago',
    imageUrl: 'https://picsum.photos/seed/bluff1/400/500',
    claim: 'I had breakfast at the same diner the Rat Pack used to go to.',
    caption: 'Sunrise on Charleston Blvd',
    voteCount: 8,
  },
  {
    id: '2',
    authorName: 'Alex Chen',
    authorHandle: 'alexchen',
    timeAgo: '4h ago',
    imageUrl: 'https://picsum.photos/seed/bluff2/400/500',
    claim: 'This is the most overrated Vegas moment — fight me.',
    caption: 'You know the one.',
    voteCount: 12,
  },
  {
    id: '3',
    authorName: 'Sam Rivera',
    authorHandle: 'samr',
    timeAgo: '5h ago',
    imageUrl: 'https://picsum.photos/seed/bluff3/400/500',
    claim: 'Best local spot in town. No tourists, no lines.',
    voteCount: 5,
  },
]
