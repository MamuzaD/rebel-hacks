import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireUserId } from './lib/auth'

/**
 * Add a comment to a post. Optional parentId for threading.
 */
export const add = mutation({
  args: {
    postId: v.id('posts'),
    text: v.string(),
    parentId: v.optional(v.id('comments')),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error('Post not found')
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId)
      if (!parent || parent.postId !== args.postId) throw new Error('Invalid parent comment')
    }
    const now = Date.now()
    return await ctx.db.insert('comments', {
      postId: args.postId,
      userId,
      parentId: args.parentId,
      text: args.text,
      createdAt: now,
    })
  },
})

/**
 * Count comments for a post (for displaying on the card without loading list).
 */
export const countByPost = query({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query('comments')
      .withIndex('postId_createdAt', (q) => q.eq('postId', args.postId))
      .collect()
    return comments.length
  },
})

/**
 * List comments for a post (flat or threaded by parentId).
 */
export const listByPost = query({
  args: { postId: v.id('posts'), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100
    const comments = await ctx.db
      .query('comments')
      .withIndex('postId_createdAt', (q) => q.eq('postId', args.postId))
      .order('asc')
      .take(limit)
    const users = await Promise.all(comments.map((c) => ctx.db.get(c.userId)))
    return comments.map((c, i) => ({ ...c, user: users[i] }))
  },
})

/**
 * Delete a comment (author only).
 */
export const remove = mutation({
  args: { commentId: v.id('comments') },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const comment = await ctx.db.get(args.commentId)
    if (!comment) throw new Error('Comment not found')
    if (comment.userId !== userId) throw new Error('Not your comment')
    await ctx.db.delete(args.commentId)
    return args.commentId
  },
})
