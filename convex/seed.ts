import { v } from 'convex/values'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import { internalAction, internalMutation } from './_generated/server'
import { getTodayDateStringLA } from './lib/roundSchedule'

// 1x1 transparent PNG (smallest valid PNG)
const MINIMAL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

const POSTING_WINDOW_MS = 2 * 60 * 1000 // 2 minutes for dev
const VOTING_WINDOW_MS = 60 * 60 * 1000 // 1 hour for dev (so voting is open after posting ends)

/**
 * Seed the database with users, an active daily prompt, and posts.
 * Run from CLI: npx convex run internal.seed:run
 *
 * Uses a stored placeholder image for all seed posts. Safe to run multiple times
 * (creates new seed users with unique clerk ids each time; prompt/post creation
 * is idempotent by not re-creating if already present for today).
 */
export const run = internalAction({
  args: {},
  handler: async (ctx) => {
    const bytes = Uint8Array.from(atob(MINIMAL_PNG_BASE64), (c) => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'image/png' })
    const storageId: Id<'_storage'> = await ctx.storage.store(blob)
    await ctx.runMutation(internal.seed.runWithStorageId, { storageId })
    return { ok: true, storageId }
  },
})

/**
 * Delete all app data (dev only). Run: npx convex run internal.seed:clearAll
 */
export const clearAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const order = [
      'votes',
      'reactions',
      'comments',
      'chipTransactions',
      'posts',
      'friendships',
      'prompts',
      'users',
    ] as const
    const counts: Record<string, number> = {}
    for (const table of order) {
      const docs = await ctx.db.query(table).collect()
      for (const doc of docs) {
        await ctx.db.delete(doc._id)
      }
      counts[table] = docs.length
    }
    return counts
  },
})

/**
 * Clear entire DB and seed with a 2-minute active posting session + 5 sample posts.
 * Run: npx convex run internal.seed:resetAndSeed
 * Then you can post as your real user and see the 5 generated posts in the feed.
 */
export const resetAndSeed = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    ok: true
    users: number
    promptId: Id<'prompts'>
    posts: number
    postingEndsAt?: number
  }> => {
    await ctx.runMutation(internal.seed.clearAll)
    const bytes = Uint8Array.from(atob(MINIMAL_PNG_BASE64), (c) => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: 'image/png' })
    const storageId: Id<'_storage'> = await ctx.storage.store(blob)
    const result = await ctx.runMutation(internal.seed.runWithStorageId, {
      storageId,
    })
    return { ok: true, ...result }
  },
})

/** 5 seed users for generated feed posts (you post as your own Clerk user). */
const SEED_USERS = [
  {
    clerkUserId: 'seed_clerk_1',
    username: 'alex_vegas',
    displayName: 'Alex',
    chipBalance: 120,
  },
  {
    clerkUserId: 'seed_clerk_2',
    username: 'jordan_local',
    displayName: 'Jordan',
    chipBalance: 85,
  },
  {
    clerkUserId: 'seed_clerk_3',
    username: 'sam_rebel',
    displayName: 'Sam',
    chipBalance: 200,
  },
  {
    clerkUserId: 'seed_clerk_4',
    username: 'morgan_sin',
    displayName: 'Morgan',
    chipBalance: 150,
  },
  {
    clerkUserId: 'seed_clerk_5',
    username: 'riley_strip',
    displayName: 'Riley',
    chipBalance: 90,
  },
]

const SEED_CAPTIONS = [
  'Best kept secret.',
  'You had to be there.',
  'No one talks about this spot.',
  'Locals only energy.',
  'Proof that Vegas can still be chill.',
]

/**
 * Internal: create seed users, one active daily prompt (2-min posting window), and 5 posts.
 */
export const runWithStorageId = internalMutation({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    const now = Date.now()
    const today = getTodayDateStringLA()
    const postWindowStart = now
    const postWindowEnd = now + POSTING_WINDOW_MS
    const revealTime = postWindowEnd + VOTING_WINDOW_MS

    const userIds: Id<'users'>[] = []
    for (const u of SEED_USERS) {
      const existing = await ctx.db
        .query('users')
        .withIndex('clerkUserId', (q) => q.eq('clerkUserId', u.clerkUserId))
        .unique()
      if (existing) {
        userIds.push(existing._id)
        continue
      }
      const id = await ctx.db.insert('users', {
        clerkUserId: u.clerkUserId,
        username: u.username,
        displayName: u.displayName,
        chipBalance: u.chipBalance,
      })
      userIds.push(id)
    }

    const existingPrompt = await ctx.db
      .query('prompts')
      .withIndex('date', (q) => q.eq('date', today))
      .unique()

    let promptId: Id<'prompts'>
    if (existingPrompt) {
      promptId = existingPrompt._id
      await ctx.db.patch(promptId, {
        postWindowStart,
        postWindowEnd,
        revealTime,
      })
    } else {
      promptId = await ctx.db.insert('prompts', {
        prompt: "What's your most overrated Vegas moment?",
        date: today,
        postWindowStart,
        postWindowEnd,
        revealTime,
      })
    }

    // 5 posts from seed users (so feed has 5 “other people” posts; you can add yours)
    const posts: Id<'posts'>[] = []
    for (let i = 0; i < 5; i++) {
      const authorId = userIds[i]
      const existing = await ctx.db
        .query('posts')
        .withIndex('authorId_promptId', (q) =>
          q.eq('authorId', authorId).eq('promptId', promptId),
        )
        .first()
      if (existing) {
        posts.push(existing._id)
        continue
      }
      const postId = await ctx.db.insert('posts', {
        authorId,
        promptId: promptId,
        imageStorageId: args.storageId,
        caption: SEED_CAPTIONS[i],
        actual: i % 3 !== 1 ? 'truth' : 'bluff',
        isRevealed: false,
        postDate: today,
        chipPot: 10 + i * 5,
      })
      posts.push(postId)
    }

    // Add a vote and a reaction on the first post so feed feels lived-in
    if (posts[0] && userIds.length >= 2) {
      const voterId = userIds[1]
      const existingVote = await ctx.db
        .query('votes')
        .withIndex('userId_postId', (q) => q.eq('userId', voterId).eq('postId', posts[0]))
        .unique()
      if (!existingVote) {
        await ctx.db.insert('votes', {
          userId: voterId,
          postId: posts[0],
          guess: 'truth',
          votedAt: now - 30_000,
        })
      }
      const reactorId = userIds[2]
      const existingReaction = await ctx.db
        .query('reactions')
        .withIndex('userId_postId', (q) => q.eq('userId', reactorId).eq('postId', posts[0]))
        .first()
      if (!existingReaction) {
        await ctx.db.insert('reactions', {
          userId: reactorId,
          postId: posts[0],
          reactionType: 'like',
          reactedAt: now - 20_000,
        })
      }
      const existingComment = await ctx.db
        .query('comments')
        .withIndex('postId', (q) => q.eq('postId', posts[0]))
        .first()
      if (!existingComment) {
        await ctx.db.insert('comments', {
          postId: posts[0],
          userId: userIds[1],
          text: 'This is the way.',
          createdAt: now - 10_000,
        })
      }
    }

    return {
      users: userIds.length,
      promptId,
      posts: posts.length,
      postingEndsAt: postWindowEnd,
    }
  },
})

/**
 * Seed accepted friends for a user by username.
 * Run: npx convex run internal.seed:seedFriendsForUsername '{"username":"daniel","count":20}'
 */
export const seedFriendsForUsername = internalMutation({
  args: {
    username: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const target = await ctx.db
      .query('users')
      .withIndex('username', (q) => q.eq('username', args.username))
      .unique()
    if (!target) {
      throw new Error(`User @${args.username} not found`)
    }

    const desired = Math.max(1, Math.floor(args.count ?? 20))
    const now = Date.now()

    // Count already-accepted friends first so we top up to desired.
    const asRequester = await ctx.db
      .query('friendships')
      .withIndex('requesterId', (q) => q.eq('requesterId', target._id))
      .filter((q) => q.eq(q.field('status'), 'accepted'))
      .collect()
    const asAddressee = await ctx.db
      .query('friendships')
      .withIndex('addresseeId', (q) => q.eq('addresseeId', target._id))
      .filter((q) => q.eq(q.field('status'), 'accepted'))
      .collect()

    const acceptedFriendIds = new Set<Id<'users'>>()
    for (const row of asRequester) acceptedFriendIds.add(row.addresseeId)
    for (const row of asAddressee) acceptedFriendIds.add(row.requesterId)

    if (acceptedFriendIds.size >= desired) {
      return {
        ok: true,
        targetUsername: target.username,
        createdUsers: 0,
        createdFriendships: 0,
        acceptedFriends: acceptedFriendIds.size,
      }
    }

    const needed = desired - acceptedFriendIds.size
    let createdUsers = 0
    let createdFriendships = 0
    let i = 1

    while (createdFriendships < needed) {
      const clerkUserId = `seed_friend_${target.username}_${i}`
      const username = `seed_${target.username}_${i}`
      const displayName = `Seed Friend ${i}`

      let friend = await ctx.db
        .query('users')
        .withIndex('clerkUserId', (q) => q.eq('clerkUserId', clerkUserId))
        .unique()

      if (!friend) {
        const friendId = await ctx.db.insert('users', {
          clerkUserId,
          username,
          displayName,
          chipBalance: 100 + i,
        })
        createdUsers += 1
        friend = await ctx.db.get(friendId)
      }

      i += 1
      if (!friend || friend._id === target._id) continue
      if (acceptedFriendIds.has(friend._id)) continue

      const forward = await ctx.db
        .query('friendships')
        .withIndex('requesterId_addresseeId', (q) =>
          q.eq('requesterId', target._id).eq('addresseeId', friend._id),
        )
        .unique()
      const reverse = await ctx.db
        .query('friendships')
        .withIndex('requesterId_addresseeId', (q) =>
          q.eq('requesterId', friend._id).eq('addresseeId', target._id),
        )
        .unique()

      if (forward) {
        if (forward.status !== 'accepted') {
          await ctx.db.patch(forward._id, {
            status: 'accepted',
            updatedAt: now,
          })
        }
      } else if (reverse) {
        if (reverse.status !== 'accepted') {
          await ctx.db.patch(reverse._id, {
            status: 'accepted',
            updatedAt: now,
          })
        }
      } else {
        await ctx.db.insert('friendships', {
          requesterId: target._id,
          addresseeId: friend._id,
          status: 'accepted',
          createdAt: now,
          updatedAt: now,
        })
      }

      acceptedFriendIds.add(friend._id)
      createdFriendships += 1
    }

    return {
      ok: true,
      targetUsername: target.username,
      createdUsers,
      createdFriendships,
      acceptedFriends: acceptedFriendIds.size,
    }
  },
})
