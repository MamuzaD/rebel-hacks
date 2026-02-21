import { v } from 'convex/values'
import { internalMutation, internalQuery, mutation, query } from './_generated/server'
import { getCurrentUserId, requireUserId } from './lib/auth'
import { executeSettlement } from './lib/settlement'
import { voteGuess } from './lib/validators'

const MIN_WAGER = 5
const MAX_WAGER = 1000

/**
 * Vote on a post (truth or bluff). Enforces: one vote per user per post;
 * voting only allowed until reveal time; wager must not exceed user balance.
 */
export const vote = mutation({
  args: {
    postId: v.id('posts'),
    guess: voteGuess,
    wager: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    if (
      args.wager < MIN_WAGER ||
      args.wager > MAX_WAGER ||
      !Number.isInteger(args.wager) ||
      args.wager % MIN_WAGER !== 0
    ) {
      throw new Error(
        `Wager must be in ${MIN_WAGER}-chip increments between ${MIN_WAGER} and ${MAX_WAGER}.`,
      )
    }
    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error('Post not found')
    if (post.authorId === userId) throw new Error("You can't vote on your own post")
    if (post.isRevealed) throw new Error('Voting closed for this post')

    const prompt = await ctx.db.get(post.promptId)
    if (!prompt) throw new Error('Prompt not found')
    if (Date.now() >= prompt.revealTime) throw new Error('Voting window closed')

    const existing = await ctx.db
      .query('votes')
      .withIndex('userId_postId', (q) => q.eq('userId', userId).eq('postId', args.postId))
      .unique()
    if (existing) throw new Error('Already voted on this post')

    const user = await ctx.db.get(userId)
    if (!user) throw new Error('User not found')
    if (user.chipBalance < args.wager) {
      throw new Error('Insufficient chips. You can only bet what you have.')
    }

    await ctx.db.patch(userId, {
      chipBalance: user.chipBalance - args.wager,
    })

    const voteId = await ctx.db.insert('votes', {
      userId,
      postId: args.postId,
      guess: args.guess,
      wager: args.wager,
      votedAt: Date.now(),
    })

    await ctx.db.insert('chipTransactions', {
      userId,
      postId: args.postId,
      voteId,
      amount: -args.wager,
      reason: 'vote_stake',
      transactionDate: Date.now(),
    })

    return args.postId
  },
})

/**
 * Get current user's vote for a post (if any).
 */
export const getMyVote = query({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx)
    if (!userId) return null
    return await ctx.db
      .query('votes')
      .withIndex('userId_postId', (q) => q.eq('userId', userId).eq('postId', args.postId))
      .unique()
  },
})

/**
 * Get vote count for a post (safe to show before reveal).
 */
export const countForPost = query({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query('votes')
      .withIndex('postId', (q) => q.eq('postId', args.postId))
      .collect()
    return list.length
  },
})

/**
 * Internal-only: get all votes for a post.
 */
export const getByPost = internalQuery({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error('Post not found')
    if (!post.isRevealed) throw new Error('Votes are not available before reveal')
    return await ctx.db
      .query('votes')
      .withIndex('postId', (q) => q.eq('postId', args.postId))
      .collect()
  },
})

/**
 * Settle a single post: compute chips, write chipTransactions, update user balances and vote.chipsWon.
 * Idempotent: if post already revealed, no-op. Call from cron or manually after revealTime.
 */
export const settlePost = internalMutation({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error('Post not found')
    if (post.isRevealed) return args.postId
    const prompt = await ctx.db.get(post.promptId)
    if (!prompt || Date.now() < prompt.revealTime) {
      throw new Error('Reveal time not reached')
    }
    const result = await executeSettlement(ctx, args.postId)
    return result ?? args.postId
  },
})
