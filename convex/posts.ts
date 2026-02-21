import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import { requireUserId } from './lib/auth'
import { normalizeRoundTimestamps } from './lib/roundSchedule'

const MIN_STAKE = 5
const MAX_STAKE = 1000
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50
const FRIENDS_SCAN_MULTIPLIER = 3
const MAX_FRIENDS_SCAN_PAGES = 5

type PublicPost = Omit<Doc<'posts'>, 'actual'> & { actual?: Doc<'posts'>['actual'] }

function toPublicPost(post: Doc<'posts'>): PublicPost {
  if (post.isRevealed) return post
  const { actual: _actual, ...rest } = post
  return rest
}

/**
 * Create a post. Enforces: one post per user per prompt,
 * and that current time is within the prompt's post window.
 */
export const create = mutation({
  args: {
    promptId: v.id('prompts'),
    imageStorageId: v.id('_storage'),
    caption: v.optional(v.string()),
    isTruth: v.boolean(),
    chipPot: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const prompt = await ctx.db.get(args.promptId)
    if (!prompt) throw new Error('Prompt not found')
    const now = Date.now()
    const normalized = normalizeRoundTimestamps(
      prompt.postWindowStart,
      prompt.postWindowEnd,
      prompt.revealTime,
    )
    if (now < normalized.postWindowStart || now >= normalized.postWindowEnd) {
      throw new Error('Outside posting window')
    }
    const existing = await ctx.db
      .query('posts')
      .withIndex('authorId_promptId', (q) => q.eq('authorId', userId).eq('promptId', args.promptId))
      .first()
    if (existing) throw new Error('Already posted for this prompt')

    const stake = args.chipPot ?? 0
    if (
      stake !== 0 &&
      (stake < MIN_STAKE ||
        stake > MAX_STAKE ||
        !Number.isInteger(stake) ||
        stake % MIN_STAKE !== 0)
    ) {
      throw new Error(
        `Post stake must be in ${MIN_STAKE}-chip increments between ${MIN_STAKE} and ${MAX_STAKE}.`,
      )
    }
    if (stake > 0) {
      const user = await ctx.db.get(userId)
      if (!user) throw new Error('User not found')
      if (user.chipBalance < stake) {
        throw new Error('Insufficient chips. You can only bet what you have.')
      }
      await ctx.db.patch(userId, {
        chipBalance: user.chipBalance - stake,
      })
    }

    const postDate = prompt.date
    const postId = await ctx.db.insert('posts', {
      authorId: userId,
      promptId: args.promptId,
      imageStorageId: args.imageStorageId,
      caption: args.caption,
      actual: args.isTruth ? 'truth' : 'bluff',
      isRevealed: false,
      postDate,
      chipPot: stake > 0 ? stake : undefined,
    })

    if (stake > 0) {
      await ctx.db.insert('chipTransactions', {
        userId,
        postId,
        amount: -stake,
        reason: 'post_stake',
        transactionDate: Date.now(),
      })
    }

    return postId
  },
})

/**
 * Get current user's post for a prompt, if one exists.
 */
export const getMineForPrompt = query({
  args: { promptId: v.id('prompts') },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx)
    const post = await ctx.db
      .query('posts')
      .withIndex('authorId_promptId', (q) => q.eq('authorId', userId).eq('promptId', args.promptId))
      .order('desc')
      .first()
    return post ? toPublicPost(post) : null
  },
})

/**
 * Get a single post by id. Revealed posts include `actual`; unrevealed posts hide it.
 */
export const getById = query({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId)
    return post ? toPublicPost(post) : null
  },
})

/**
 * List posts for feed, optionally scoped to a prompt.
 * Revealed posts include `actual`; unrevealed posts hide it.
 */
export const listForFeed = query({
  args: {
    postDate: v.optional(v.string()),
    promptId: v.optional(v.id('prompts')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(1, Math.floor(args.limit ?? 50)), 100)
    if (args.promptId) {
      const promptPosts = await (args.postDate
        ? ctx.db
            .query('posts')
            .withIndex('promptId', (q) => q.eq('promptId', args.promptId!))
            .order('desc')
            .collect()
        : ctx.db
            .query('posts')
            .withIndex('promptId', (q) => q.eq('promptId', args.promptId!))
            .order('desc')
            .take(limit))
      const filtered = args.postDate
        ? promptPosts.filter((post) => post.postDate === args.postDate)
        : promptPosts
      return filtered.slice(0, limit).map(toPublicPost)
    }
    if (args.postDate) {
      const posts = await ctx.db
        .query('posts')
        .withIndex('postDate', (q) => q.eq('postDate', args.postDate!))
        .order('desc')
        .take(limit)
      return posts.map(toPublicPost)
    }
    const posts = await ctx.db.query('posts').order('desc').take(limit)
    return posts.map(toPublicPost)
  },
})

/**
 * List posts by author (for profile).
 */
export const listByAuthor = query({
  args: { authorId: v.id('users'), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(1, Math.floor(args.limit ?? 30)), 100)
    const posts = await ctx.db
      .query('posts')
      .withIndex('authorId', (q) => q.eq('authorId', args.authorId))
      .order('desc')
      .take(limit)
    return posts.map(toPublicPost)
  },
})

/**
 * Cursor-paginated global feed for infinite scrolling.
 */
export const listGlobalFeedPaginated = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(1, Math.floor(args.limit ?? DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE)
    const page = await ctx.db
      .query('posts')
      .order('desc')
      .paginate({
        numItems: limit,
        cursor: args.cursor ?? null,
      })

    return {
      posts: page.page.map(toPublicPost),
      nextCursor: page.isDone ? null : page.continueCursor,
    }
  },
})

/**
 * Cursor-paginated friends feed for infinite scrolling.
 * Includes accepted friends' posts and the current user's own posts.
 */
export const listFriendsFeedPaginated = query({
  args: {
    friendIds: v.array(v.id('users')),
    currentUserId: v.optional(v.id('users')),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(1, Math.floor(args.limit ?? DEFAULT_PAGE_SIZE)), MAX_PAGE_SIZE)
    const allowedAuthorIds = new Set(args.friendIds)
    if (args.currentUserId) {
      allowedAuthorIds.add(args.currentUserId)
    }
    if (allowedAuthorIds.size === 0) {
      return { posts: [], nextCursor: null }
    }

    const pageSize = Math.min(Math.max(limit * FRIENDS_SCAN_MULTIPLIER, 30), 200)
    const matches: PublicPost[] = []
    let cursor: string | null = args.cursor ?? null
    let scans = 0
    let reachedEnd = false

    while (matches.length < limit && scans < MAX_FRIENDS_SCAN_PAGES && !reachedEnd) {
      const page = await ctx.db.query('posts').order('desc').paginate({
        numItems: pageSize,
        cursor,
      })
      scans += 1

      for (const post of page.page) {
        if (!allowedAuthorIds.has(post.authorId)) continue
        matches.push(toPublicPost(post))
        if (matches.length >= limit) break
      }

      if (page.isDone) {
        reachedEnd = true
        cursor = null
      } else {
        cursor = page.continueCursor
      }
    }

    return {
      posts: matches,
      nextCursor: reachedEnd ? null : cursor,
    }
  },
})

/**
 * Dev-only helper to seed feed data quickly:
 * creates 3 prompts and ~15 posts tied to those prompts.
 */
export const seedDevPosts = mutation({
  args: {
    totalPosts: v.optional(v.number()),
    promptCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const totalPosts = Math.max(1, Math.floor(args.totalPosts ?? 15))
    const promptCount = Math.max(1, Math.floor(args.promptCount ?? 3))
    const postsPerPrompt = Math.ceil(totalPosts / promptCount)
    const now = Date.now()

    const promptTexts = [
      "What's your most overrated Vegas moment?",
      "What's the one spot you'd never tell tourists about?",
      "Best Vegas moment that didn't cost a dime.",
      'What would you tell a tourist to skip?',
      'Something that only a Vegas local would know.',
    ]
    const captions = [
      'This spot has the best late-night bite in town.',
      "No one talks about this hidden view, but it's elite.",
      "I found a zero-dollar plan that's better than most paid attractions.",
      'The line looks long, but it moves in under 10 minutes every time.',
      'Locals know this is where the real vibe starts.',
      "Tourists skip this place and that's exactly why it's great.",
      'This is the best pregame stop before Fremont.',
      'Most people overpay nearby when this option is better.',
      'Lowkey one of my favorite nights this month.',
      'Not gatekeeping... but maybe a little.',
      'Proof that Vegas can still be chill.',
      'If you know, you know.',
    ]

    const users = await ctx.db.query('users').collect()
    const targetUserCount = 6
    if (users.length < targetUserCount) {
      const missing = targetUserCount - users.length
      for (let i = 0; i < missing; i++) {
        const n = users.length + i + 1
        const userId = await ctx.db.insert('users', {
          clerkUserId: `dev_seed_user_${n}`,
          username: `seeduser${n}`,
          displayName: `Seed User ${n}`,
          chipBalance: 1000,
          avatarUrl: undefined,
        })
        const user = await ctx.db.get(userId)
        if (user) users.push(user)
      }
    }

    const existingPost = await ctx.db.query('posts').first()
    if (!existingPost) {
      throw new Error(
        'seedDevPosts requires at least one existing post image in storage. Create one post first.',
      )
    }
    const seedImageStorageId = existingPost.imageStorageId

    const promptDocs: Array<{ _id: Doc<'prompts'>['_id']; date: string }> = []
    for (let i = 0; i < promptCount; i++) {
      const daysAgo = promptCount - 1 - i
      const ts = now - daysAgo * 24 * 60 * 60 * 1000
      const date = new Date(ts).toISOString().slice(0, 10)
      const existing = await ctx.db
        .query('prompts')
        .withIndex('date', (q) => q.eq('date', date))
        .unique()

      if (existing) {
        promptDocs.push({ _id: existing._id, date })
        continue
      }

      const promptId = await ctx.db.insert('prompts', {
        prompt: promptTexts[i % promptTexts.length],
        date,
        postWindowStart: ts - 2 * 60 * 60 * 1000,
        postWindowEnd: ts + 2 * 60 * 60 * 1000,
        revealTime: ts + 24 * 60 * 60 * 1000,
      })
      promptDocs.push({ _id: promptId, date })
    }

    let createdPosts = 0
    for (let p = 0; p < promptDocs.length; p++) {
      for (let j = 0; j < postsPerPrompt && createdPosts < totalPosts; j++) {
        const author = users[(p * postsPerPrompt + j) % users.length]
        const imageStorageId = seedImageStorageId

        const caption = captions[(p + j) % captions.length]

        await ctx.db.insert('posts', {
          authorId: author._id,
          promptId: promptDocs[p]._id,
          imageStorageId,
          caption,
          actual: (p + j) % 3 !== 0 ? 'truth' : 'bluff',
          isRevealed: p < promptDocs.length - 1,
          revealedAt: p < promptDocs.length - 1 ? now - p * 1000 : undefined,
          postDate: promptDocs[p].date,
          chipPot: 50 + ((p + j) % 6) * 25,
        })
        createdPosts += 1
      }
    }

    return {
      createdPosts,
      promptsUsed: promptDocs.map((p) => p._id),
      promptDates: promptDocs.map((p) => p.date),
      usersAvailable: users.length,
    }
  },
})
