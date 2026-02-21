import type { PostCardData } from '.'

/**
 * Demo posts for the Table Feed (notes: Vegas theme, 1 photo, optional caption).
 * Vote count shown; reactions are available on real feed cards.
 */
export const DEMO_POSTS: PostCardData[] = [
  {
    id: '1',
    authorName: 'Jordan Reed',
    authorHandle: 'jreed',
    timeAgo: '2h ago',
    imageUrl: 'https://picsum.photos/seed/bluff1/400/500',
    caption:
      'I had breakfast at the same diner the Rat Pack used to go to. Sunrise on Charleston Blvd.',
    voteCount: 8,
  },
  {
    id: '2',
    authorName: 'Alex Chen',
    authorHandle: 'alexchen',
    timeAgo: '4h ago',
    imageUrl: 'https://picsum.photos/seed/bluff2/400/500',
    caption: 'This is the most overrated Vegas moment — fight me. You know the one.',
    voteCount: 12,
  },
  {
    id: '3',
    authorName: 'Sam Rivera',
    authorHandle: 'samr',
    timeAgo: '5h ago',
    imageUrl: 'https://picsum.photos/seed/bluff3/400/500',
    caption: 'Best local spot in town. No tourists, no lines.',
    voteCount: 5,
  },
]
