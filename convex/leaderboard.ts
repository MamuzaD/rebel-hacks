import { v } from 'convex/values'
import { query } from './_generated/server'
import { getCurrentUserId } from './lib/auth'

/**
 * Global leaderboard by chip balance. Computed from users table; no snapshot.
 */
export const listByChips = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50
    const users = await ctx.db.query('users').collect()
    users.sort((a, b) => b.chipBalance - a.chipBalance)
    return users.slice(0, limit)
  },
})

/**
 * Current user's rank (1-based) on global leaderboard by chips. Returns null if not logged in.
 */
export const myGlobalRank = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx)
    if (!userId) return null
    const me = await ctx.db.get(userId)
    if (!me) return null
    const users = await ctx.db.query('users').collect()
    users.sort((a, b) => b.chipBalance - a.chipBalance)
    const rank = users.findIndex((u) => u._id === userId)
    return rank === -1 ? null : rank + 1
  },
})
