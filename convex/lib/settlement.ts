import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

/** Fallback wager for votes created before wager was stored (legacy). */
const DEFAULT_WAGER = 25

/**
 * Settle a single post: compute chips from each vote's wager, write chipTransactions, update user balances and vote.chipsWon.
 * Idempotent: if post already revealed, no-op. Caller must ensure reveal time has passed.
 */
export async function executeSettlement(
  ctx: MutationCtx,
  postId: Id<'posts'>,
): Promise<Id<'posts'> | null> {
  const post = await ctx.db.get(postId)
  if (!post || post.isRevealed) return null

  const prompt = await ctx.db.get(post.promptId)
  if (!prompt || Date.now() < prompt.revealTime) return null

  const votesList = await ctx.db
    .query('votes')
    .withIndex('postId', (q) => q.eq('postId', postId))
    .collect()

  const isTruth = post.actual === 'truth'
  let chipPot = 0
  const now = Date.now()

  for (const v of votesList) {
    const wager = v.wager ?? DEFAULT_WAGER
    const correct = v.guess === 'truth' ? isTruth : !isTruth

    if (correct) {
      const payout = 2 * wager
      chipPot += payout
      await ctx.db.insert('chipTransactions', {
        userId: v.userId,
        postId,
        voteId: v._id,
        amount: payout,
        reason: 'vote_correct',
        transactionDate: now,
      })
      await ctx.db.patch(v._id, { chipsWon: wager })
      const user = await ctx.db.get(v.userId)
      if (user) {
        await ctx.db.patch(v.userId, {
          chipBalance: user.chipBalance + payout,
        })
      }
    } else {
      // Losing stake is already deducted when the vote is placed.
      await ctx.db.patch(v._id, { chipsWon: -wager })
    }
  }

  if (isTruth === false && votesList.some((v) => v.guess === 'truth')) {
    const posterBonus = votesList
      .filter((v) => v.guess === 'truth')
      .reduce((sum, v) => sum + (v.wager ?? DEFAULT_WAGER), 0)
    await ctx.db.insert('chipTransactions', {
      userId: post.authorId,
      postId,
      amount: posterBonus,
      reason: 'bluff_fooled',
      transactionDate: now,
    })
    const author = await ctx.db.get(post.authorId)
    if (author) {
      await ctx.db.patch(post.authorId, {
        chipBalance: author.chipBalance + posterBonus,
      })
    }
    chipPot += posterBonus
  }

  await ctx.db.patch(postId, {
    isRevealed: true,
    revealedAt: now,
    chipPot,
  })
  return postId
}
