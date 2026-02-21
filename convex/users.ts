import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUserId } from './lib/auth'

const USERNAME_MIN_LENGTH = 6
const USERNAME_MAX_LENGTH = 64

/**
 * Sync or create the current user from Clerk identity.
 * Call after sign-in. Username is required (Clerk is configured to require username).
 */
export const syncFromClerk = mutation({
  args: {
    username: v.string(),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const clerkUserId = identity.subject

    const raw = args.username.trim()
    if (raw.length < USERNAME_MIN_LENGTH || raw.length > USERNAME_MAX_LENGTH) {
      throw new Error(
        `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`,
      )
    }
    const username = raw

    const displayName =
      args.displayName ?? identity.name ?? identity.email ?? identity.subject.slice(0, 8)
    const avatarUrl = args.avatarUrl ?? identity.pictureUrl ?? undefined
    const existing = await ctx.db
      .query('users')
      .withIndex('clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
      .unique()
    if (existing) {
      const usernameOwner = await ctx.db
        .query('users')
        .withIndex('username', (q) => q.eq('username', username))
        .first()
      if (usernameOwner && usernameOwner._id !== existing._id) {
        throw new Error('Username is already taken')
      }
      await ctx.db.patch(existing._id, {
        username,
        displayName,
        avatarUrl,
      })
      return existing._id
    }
    const usernameOwner = await ctx.db
      .query('users')
      .withIndex('username', (q) => q.eq('username', username))
      .first()
    if (usernameOwner) {
      throw new Error('Username is already taken')
    }
    return await ctx.db.insert('users', {
      clerkUserId,
      username,
      displayName,
      avatarUrl,
      chipBalance: 500,
    })
  },
})

/**
 * Get the current user's Convex profile (by auth). Returns null if not logged in or not synced.
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx)
    if (!userId) return null
    return await ctx.db.get(userId)
  },
})

/**
 * Get a user by Convex id (for profiles, post authors, etc.).
 */
export const getById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId)
  },
})

/**
 * Get user by username (for profile URLs).
 */
export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('users')
      .withIndex('username', (q) => q.eq('username', args.username))
      .first()
  },
})
