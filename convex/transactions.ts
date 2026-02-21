import { v } from 'convex/values'
import { query } from './_generated/server'
import { requireUserId } from './lib/auth'

/**
 * List current user's chip transactions, newest first, with post and vote context for display.
 */
export const listMyTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const limit = Math.min(args.limit ?? 100, 200)
    const transactions = await ctx.db
      .query('chipTransactions')
      .withIndex('userId_transactionDate', (q) => q.eq('userId', userId))
      .order('desc')
      .take(limit)

    const enriched = await Promise.all(
      transactions.map(async (tx) => {
        const post = tx.postId ? await ctx.db.get(tx.postId) : null
        const prompt = post ? await ctx.db.get(post.promptId) : null
        const vote = tx.voteId ? await ctx.db.get(tx.voteId) : null

        return {
          _id: tx._id,
          postId: tx.postId,
          voteId: tx.voteId,
          amount: tx.amount,
          reason: tx.reason,
          transactionDate: tx.transactionDate,
          postCaption: post?.caption,
          postDate: post?.postDate,
          promptText: prompt?.prompt,
          isRevealed: post?.isRevealed,
          actual: post?.isRevealed ? post.actual : undefined,
          myGuess: vote?.guess,
          wager: vote?.wager,
        }
      }),
    )

    return enriched
  },
})
