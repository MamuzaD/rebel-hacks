import { v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'
import { pickRandomPrompt } from './lib/prompts'
import {
  getDateStringLA,
  getNextDateString,
  getPreviousDateString,
  getRoundTimestamps,
  getTodayDateStringLA,
  normalizeRoundTimestamps,
} from './lib/roundSchedule'
import { getChallengeLabel, getRoundPhase, getStatusPayload } from './lib/statusLine'

/**
 * Get the prompt that should drive the UI right now, plus backend-computed status.
 * - Prefer a round whose posting window contains now (so after midnight LA we still show yesterday's round until it closes).
 * - Otherwise return the nearest upcoming round.
 * - Fallback to the most recently created round.
 * Status line is computed server-side and never includes time-range strings.
 */
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const recentPrompts = await ctx.db.query('prompts').order('desc').take(30)
    if (recentPrompts.length === 0) return null

    const normalized = recentPrompts.map((prompt) => ({
      prompt,
      ...normalizeRoundTimestamps(prompt.postWindowStart, prompt.postWindowEnd, prompt.revealTime),
    }))

    const inPostingWindow = normalized.find(
      (n) => now >= n.postWindowStart && now < n.postWindowEnd,
    )
    const chosen = inPostingWindow
      ? inPostingWindow
      : (() => {
          const nearestUpcoming = recentPrompts
            .filter((p) => p.postWindowStart > now)
            .sort((a, b) => a.postWindowStart - b.postWindowStart)
            .at(0)
          const prompt = nearestUpcoming ?? recentPrompts[0]
          return normalized.find((n) => n.prompt._id === prompt._id)!
        })()

    const previous = normalized
      .filter((n) => n.postWindowEnd < chosen.postWindowStart)
      .sort((a, b) => b.postWindowEnd - a.postWindowEnd)
      .at(0)
    const previousPostingFinishedAt = previous?.postWindowEnd

    const statusPayload = getStatusPayload(
      now,
      chosen.postWindowStart,
      chosen.postWindowEnd,
      chosen.revealTime,
      previousPostingFinishedAt,
    )

    const phase = getRoundPhase(
      now,
      chosen.postWindowStart,
      chosen.postWindowEnd,
      chosen.revealTime,
    )

    const challengeLabel = getChallengeLabel(now, chosen.postWindowStart, phase)

    return {
      prompt: chosen.prompt,
      isActive: now >= chosen.postWindowStart && now < chosen.postWindowEnd,
      statusKind: statusPayload.kind,
      statusTimeMs: statusPayload.statusTimeMs ?? undefined,
      postingEndsAt: chosen.postWindowEnd,
      challengeLabel,
      phase,
      previousPostingFinishedAt,
    }
  },
})

export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('prompts')
      .withIndex('date', (q) => q.eq('date', args.date))
      .unique()
  },
})

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30
    return ctx.db.query('prompts').order('desc').take(limit)
  },
})

export const create = mutation({
  args: {
    prompt: v.string(),
    date: v.string(),
    postWindowStart: v.number(),
    postWindowEnd: v.number(),
    revealTime: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('prompts', {
      prompt: args.prompt,
      date: args.date,
      postWindowStart: args.postWindowStart,
      postWindowEnd: args.postWindowEnd,
      revealTime: args.revealTime,
    })
  },
})

export const ensureTodayRound = internalMutation({
  args: {},
  handler: async (ctx) => {
    const ensureRound = async (date: string) => {
      const existing = await ctx.db
        .query('prompts')
        .withIndex('date', (q) => q.eq('date', date))
        .unique()
      if (existing) {
        return existing._id
      }

      const nextDate = getNextDateString(date)
      const nextPrompt = await ctx.db
        .query('prompts')
        .withIndex('date', (q) => q.eq('date', nextDate))
        .unique()
      const nextRoundStartMs = nextPrompt?.postWindowStart

      const { postWindowStart, postWindowEnd, revealTime } = getRoundTimestamps(
        date,
        nextRoundStartMs,
      )
      const id = await ctx.db.insert('prompts', {
        prompt: pickRandomPrompt(),
        date,
        postWindowStart,
        postWindowEnd,
        revealTime,
      })
      const prevDate = getPreviousDateString(date)
      const prevPrompt = await ctx.db
        .query('prompts')
        .withIndex('date', (q) => q.eq('date', prevDate))
        .unique()
      if (prevPrompt) {
        await ctx.db.patch(prevPrompt._id, { revealTime: postWindowStart })
      }
      return id
    }

    await ensureRound(getTodayDateStringLA())
    return ensureRound(getDateStringLA(-1))
  },
})

export const seedDevPrompt = mutation({
  args: {
    prompt: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const date = args.date ?? getTodayDateStringLA()
    const postWindowStart = now
    const postWindowEnd = now + 2 * 60 * 60 * 1000
    const revealTime = now + 24 * 60 * 60 * 1000
    const promptText = args.prompt ?? "What's your most overrated Vegas moment?"
    return ctx.db.insert('prompts', {
      prompt: promptText,
      date,
      postWindowStart,
      postWindowEnd,
      revealTime,
    })
  },
})
