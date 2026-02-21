import type { Id } from '@/convex/_generated/dataModel'

export type FriendshipStatus = {
  friendshipId: Id<'friendships'>
  status: 'pending' | 'accepted' | 'blocked'
  isSender: boolean
} | null
