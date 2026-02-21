import { v } from 'convex/values'

/** Vote guess: truth or bluff */
export const voteGuess = v.union(v.literal('truth'), v.literal('bluff'))

/** Preset reaction types (aligned with frontend emoji reactions) */
export const reactionType = v.union(
  v.literal('like'),
  v.literal('love'),
  v.literal('haha'),
  v.literal('wow'),
  v.literal('sad'),
)

/** Reason for a chip transaction */
export const chipReason = v.union(
  v.literal('post_stake'),
  v.literal('vote_stake'),
  v.literal('vote_correct'),
  v.literal('vote_incorrect'),
  v.literal('bluff_fooled'),
  v.literal('all_in_bonus'),
  v.literal('receipts_bonus'),
)

/** Friendship request status */
export const friendshipStatus = v.union(
  v.literal('pending'),
  v.literal('accepted'),
  v.literal('blocked'),
)

