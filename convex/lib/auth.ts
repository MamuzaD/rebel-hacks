import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

/**
 * Returns the Convex user id for the current authenticated user (Clerk).
 * Returns null if not authenticated or user record not yet synced.
 */
export async function getCurrentUserId(ctx: QueryCtx | MutationCtx): Promise<Id<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  const user = await ctx.db
    .query('users')
    .withIndex('clerkUserId', (q) => q.eq('clerkUserId', identity.subject))
    .unique()
  return user?._id ?? null
}

/**
 * Throws if not authenticated or user not synced. Use when mutation requires a user.
 */
export async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<Id<'users'>> {
  const id = await getCurrentUserId(ctx)
  if (id === null) throw new Error('Unauthenticated or user not found')
  return id
}
