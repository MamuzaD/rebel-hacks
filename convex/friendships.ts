import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { getCurrentUserId, requireUserId } from './lib/auth'

async function loadPairFriendships(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>,
  otherUserId: Id<'users'>,
): Promise<{
  forward: Doc<'friendships'> | null
  reverse: Doc<'friendships'> | null
}> {
  const [forward, reverse] = await Promise.all([
    ctx.db
      .query('friendships')
      .withIndex('requesterId_addresseeId', (q) =>
        q.eq('requesterId', userId).eq('addresseeId', otherUserId),
      )
      .unique(),
    ctx.db
      .query('friendships')
      .withIndex('requesterId_addresseeId', (q) =>
        q.eq('requesterId', otherUserId).eq('addresseeId', userId),
      )
      .unique(),
  ])
  return { forward, reverse }
}

/**
 * Send a friend request (creates pending friendship).
 */
export const request = mutation({
  args: { addresseeId: v.id('users') },
  handler: async (ctx, args) => {
    const requesterId = await requireUserId(ctx)
    if (requesterId === args.addresseeId) throw new Error('Cannot friend yourself')
    const { forward: existing, reverse } = await loadPairFriendships(
      ctx,
      requesterId,
      args.addresseeId,
    )
    if (existing) {
      if (existing.status === 'accepted') throw new Error('Already friends')
      if (existing.status === 'pending') throw new Error('Request already pending')
      throw new Error('Cannot send request')
    }
    if (reverse) {
      if (reverse.status === 'accepted') throw new Error('Already friends')
      if (reverse.status === 'pending') throw new Error('They already sent you a request')
    }
    const now = Date.now()
    return await ctx.db.insert('friendships', {
      requesterId,
      addresseeId: args.addresseeId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })
  },
})

/**
 * Accept a friend request.
 */
export const accept = mutation({
  args: { friendshipId: v.id('friendships') },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const row = await ctx.db.get(args.friendshipId)
    if (!row) throw new Error('Friendship not found')
    if (row.addresseeId !== userId) throw new Error('Not the addressee')
    if (row.status !== 'pending') throw new Error('Request not pending')
    const now = Date.now()
    await ctx.db.patch(args.friendshipId, {
      status: 'accepted',
      updatedAt: now,
    })
    return args.friendshipId
  },
})

/**
 * Reject or cancel a friend request (delete or set blocked; we delete for simplicity).
 */
export const reject = mutation({
  args: { friendshipId: v.id('friendships') },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const row = await ctx.db.get(args.friendshipId)
    if (!row) throw new Error('Friendship not found')
    if (row.addresseeId !== userId && row.requesterId !== userId) {
      throw new Error('Not your request')
    }
    await ctx.db.delete(args.friendshipId)
    return args.friendshipId
  },
})

/**
 * Unfriend (delete accepted friendship).
 */
export const unfriend = mutation({
  args: { otherUserId: v.id('users') },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const { forward, reverse } = await loadPairFriendships(ctx, userId, args.otherUserId)
    const row = forward ?? reverse
    if (!row || row.status !== 'accepted') throw new Error('Not friends')
    await ctx.db.delete(row._id)
    return row._id
  },
})

/**
 * List accepted friends (user ids) for the current user.
 */
export const listFriendIds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx)
    if (!userId) return []
    const asRequester = await ctx.db
      .query('friendships')
      .withIndex('requesterId', (q) => q.eq('requesterId', userId))
      .filter((q) => q.eq(q.field('status'), 'accepted'))
      .collect()
    const asAddressee = await ctx.db
      .query('friendships')
      .withIndex('addresseeId', (q) => q.eq('addresseeId', userId))
      .filter((q) => q.eq(q.field('status'), 'accepted'))
      .collect()
    const ids = new Set<typeof userId>()
    asRequester.forEach((r) => ids.add(r.addresseeId))
    asAddressee.forEach((r) => ids.add(r.requesterId))
    return Array.from(ids)
  },
})

/**
 * List accepted friends (full user docs) for a specific user.
 */
export const listForUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const asRequester = await ctx.db
      .query('friendships')
      .withIndex('requesterId', (q) => q.eq('requesterId', args.userId))
      .filter((q) => q.eq(q.field('status'), 'accepted'))
      .collect()
    const asAddressee = await ctx.db
      .query('friendships')
      .withIndex('addresseeId', (q) => q.eq('addresseeId', args.userId))
      .filter((q) => q.eq(q.field('status'), 'accepted'))
      .collect()

    const ids = new Set<typeof args.userId>()
    asRequester.forEach((r) => ids.add(r.addresseeId))
    asAddressee.forEach((r) => ids.add(r.requesterId))

    const friends = await Promise.all(Array.from(ids).map((friendId) => ctx.db.get(friendId)))
    return friends.filter((f): f is NonNullable<typeof f> => f !== null)
  },
})

/**
 * List pending requests received by the current user.
 */
export const listPendingReceived = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)
    const rows = await ctx.db
      .query('friendships')
      .withIndex('addresseeId_status', (q) => q.eq('addresseeId', userId).eq('status', 'pending'))
      .collect()
    const requesters = await Promise.all(rows.map((r) => ctx.db.get(r.requesterId)))
    return rows.map((r, i) => ({ ...r, requester: requesters[i] }))
  },
})

/**
 * List pending requests sent by the current user.
 */
export const listPendingSent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx)
    return await ctx.db
      .query('friendships')
      .withIndex('requesterId', (q) => q.eq('requesterId', userId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect()
  },
})

/**
 * Get the friendship status between the current user and another user.
 * Returns null if no relationship exists.
 */
export const getStatusWith = query({
  args: { otherUserId: v.id('users') },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx)
    if (!userId) return null
    const { forward, reverse } = await loadPairFriendships(ctx, userId, args.otherUserId)
    if (forward) return { friendshipId: forward._id, status: forward.status, isSender: true }
    if (reverse) return { friendshipId: reverse._id, status: reverse.status, isSender: false }
    return null
  },
})

/**
 * Check if two users are friends (accepted).
 */
export const areFriends = query({
  args: {
    userId: v.id('users'),
    otherUserId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const { forward, reverse } = await loadPairFriendships(ctx, args.userId, args.otherUserId)
    const row = forward ?? reverse
    return row?.status === 'accepted'
  },
})
