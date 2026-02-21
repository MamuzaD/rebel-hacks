import type { Id } from '@/convex/_generated/dataModel'

export type RequestRow = {
  _id: Id<'friendships'>
  requesterId: Id<'users'>
  requester: {
    _id: Id<'users'>
    username: string
    displayName: string
    avatarUrl?: string
  } | null
}

export type SentRequestRow = {
  _id: Id<'friendships'>
  addresseeId: Id<'users'>
}
