/**
 * Round phase/cycle from current time and schedule (UTC timestamps).
 * Status line text is computed on the backend (convex/lib/statusLine) and
 * returned by prompts.getActive. This module keeps only phase/cycle
 * helpers used for client-side gating (e.g. CreatePostModal).
 */

/** Per-prompt phases: this prompt's lifecycle. */
export type RoundPhase = 'before_open' | 'posting' | 'voting' | 'revealed'

/** App cycle: either voting/betting on the feed or posting to today's prompt. */
export type RoundCyclePhase = 'voting' | 'posting'

const POST_WINDOW_DURATION_MS = 4 * 60 * 60 * 1000

function normalizeRoundSchedule(
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
) {
  const normalizedPostWindowEnd = Math.max(postWindowEnd, postWindowStart + POST_WINDOW_DURATION_MS)
  const normalizedRevealTime = Math.max(revealTime, normalizedPostWindowEnd)
  return {
    postWindowStart,
    postWindowEnd: normalizedPostWindowEnd,
    revealTime: normalizedRevealTime,
  }
}

/** Phase of a specific prompt (before_open → posting → voting → revealed). */
export function getRoundPhase(
  now: number,
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
): RoundPhase {
  const normalized = normalizeRoundSchedule(postWindowStart, postWindowEnd, revealTime)
  if (now < normalized.postWindowStart) return 'before_open'
  if (now < normalized.postWindowEnd) return 'posting'
  if (now < normalized.revealTime) return 'voting'
  return 'revealed'
}

/** Whether the prompt's voting window is open (time A through C: can vote from round start until next round starts). */
export function isVotingWindowOpen(
  now: number,
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
): boolean {
  const phase = getRoundPhase(now, postWindowStart, postWindowEnd, revealTime)
  return phase === 'posting' || phase === 'voting'
}

/** Current point in the daily cycle: voting (vote/bet on feed) or posting (4h window). */
export function getRoundCyclePhase(
  now: number,
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
): RoundCyclePhase {
  const normalized = normalizeRoundSchedule(postWindowStart, postWindowEnd, revealTime)
  if (now >= normalized.postWindowStart && now < normalized.postWindowEnd) return 'posting'
  return 'voting'
}
