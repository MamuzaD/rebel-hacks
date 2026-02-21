import { internalMutation } from './_generated/server'
import { executeSettlement } from './lib/settlement'

/**
 * Run settlement for all posts whose prompt's reveal time has passed.
 * Call from cron (e.g. every 5 min) or after reveal time.
 */
export const runSettlement = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const unrevealed = await ctx.db
      .query('posts')
      .withIndex('isRevealed', (q) => q.eq('isRevealed', false))
      .collect()
    let settled = 0

    for (const post of unrevealed) {
      const prompt = await ctx.db.get(post.promptId)
      if (!prompt || prompt.revealTime > now) continue
      const result = await executeSettlement(ctx, post._id)
      if (result) settled += 1
    }
    return { settled }
  },
})
