import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUserId, requireUserId } from './lib/auth'
import { reactionType } from './lib/validators'

/**
 * Add/update/remove the current user's reaction on a post.
 * - Same reaction again removes it (toggle off).
 * - Different reaction replaces the existing one.
 */
export const add = mutation({
  args: {
    postId: v.id('posts'),
    reactionType,
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error('Post not found')
    const existing = await ctx.db
      .query('reactions')
      .withIndex('userId_postId', (q) => q.eq('userId', userId).eq('postId', args.postId))
      .first()
    const now = Date.now()
    if (existing && existing.reactionType === args.reactionType) {
      await ctx.db.delete(existing._id)
      return { reactionId: null, removed: true }
    }
    if (existing) {
      await ctx.db.patch(existing._id, {
        reactionType: args.reactionType,
        reactedAt: now,
      })
      return { reactionId: existing._id, removed: false }
    }
    const reactionId = await ctx.db.insert('reactions', {
      userId,
      postId: args.postId,
      reactionType: args.reactionType,
      reactedAt: now,
    })
    return { reactionId, removed: false }
  },
})

/**
 * Get reaction counts by type for a post (for display).
 */
export const getCountsByPost = query({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query('reactions')
      .withIndex('postId', (q) => q.eq('postId', args.postId))
      .collect()
    const counts: Record<string, number> = {}
    for (const r of list) {
      counts[r.reactionType] = (counts[r.reactionType] ?? 0) + 1
    }
    return counts
  },
})

/**
 * Get current user's reaction for a post (if any).
 */
export const getMyReaction = query({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx)
    if (!userId) return null
    return await ctx.db
      .query('reactions')
      .withIndex('userId_postId', (q) => q.eq('userId', userId).eq('postId', args.postId))
      .first()
  },
})
