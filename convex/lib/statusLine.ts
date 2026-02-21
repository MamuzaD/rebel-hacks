/**
 * Canonical status line for the feed prompt. Computed on the backend only.
 * Never emits time-range strings (e.g. "6:47 PM-10:47 PM").
 */

import { normalizeRoundTimestamps } from './roundSchedule'

export type RoundPhase = 'before_open' | 'posting' | 'voting' | 'revealed'

/** Used only for relative "time until" in posting_begun; server timezone is irrelevant. */
export function formatTimeForLog(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/** Relative time until a future timestamp (e.g. "in 2h", "in 34m"). */
function timeUntil(endMs: number, now: number): string {
  const sec = Math.max(0, Math.floor((endMs - now) / 1000))
  if (sec < 60) return 'soon'
  const min = Math.floor(sec / 60)
  if (min < 60) return `in ${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `in ${hr}h`
  const day = Math.floor(hr / 24)
  if (day < 7) return `in ${day}d`
  return `in ${Math.floor(day / 7)}w`
}

function getPhase(
  now: number,
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
): RoundPhase {
  const n = normalizeRoundTimestamps(postWindowStart, postWindowEnd, revealTime)
  if (now < n.postWindowStart) return 'before_open'
  if (now < n.postWindowEnd) return 'posting'
  if (now < n.revealTime) return 'voting'
  return 'revealed'
}

function isPosting(
  now: number,
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
): boolean {
  const n = normalizeRoundTimestamps(postWindowStart, postWindowEnd, revealTime)
  return now >= n.postWindowStart && now < n.postWindowEnd
}

export type StatusKind = 'previous_finished' | 'posting_begun' | 'posting_opens'

/**
 * Returns status kind and the timestamp to show (for local formatting on frontend).
 * Never emits time-range strings. Frontend formats statusTimeMs in user's local timezone.
 */
export function getStatusPayload(
  now: number,
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
  previousRoundEndMs: number | undefined,
): { kind: StatusKind; statusTimeMs?: number; postingEndsAt?: number } {
  const n = normalizeRoundTimestamps(postWindowStart, postWindowEnd, revealTime)

  if (isPosting(now, postWindowStart, postWindowEnd, revealTime)) {
    return { kind: 'posting_begun', postingEndsAt: n.postWindowEnd }
  }

  const phase = getPhase(now, postWindowStart, postWindowEnd, revealTime)
  if (phase === 'before_open') {
    if (previousRoundEndMs != null) {
      return { kind: 'previous_finished', statusTimeMs: previousRoundEndMs }
    }
    return { kind: 'posting_opens', statusTimeMs: n.postWindowStart }
  }

  return { kind: 'previous_finished', statusTimeMs: n.postWindowEnd }
}

/**
 * Build status line with server-formatted time (UTC). Prefer using getStatusPayload
 * and formatting on the frontend for user's local time.
 */
export function buildStatusLine(
  now: number,
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
  previousRoundEndMs: number | undefined,
): string {
  const payload = getStatusPayload(
    now,
    postWindowStart,
    postWindowEnd,
    revealTime,
    previousRoundEndMs,
  )

  if (payload.kind === 'posting_begun' && payload.postingEndsAt != null) {
    return `Posting has begun, you have until ${timeUntil(payload.postingEndsAt, now)}`
  }
  if (payload.kind === 'previous_finished' && payload.statusTimeMs != null) {
    return `Previous posting finished at ${formatTimeForLog(payload.statusTimeMs)}`
  }
  if (payload.kind === 'posting_opens') {
    return 'Vote and bet on the feed'
  }
  return 'Vote and bet on the feed'
}

export function getRoundPhase(
  now: number,
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
): RoundPhase {
  return getPhase(now, postWindowStart, postWindowEnd, revealTime)
}

export function isInPostingWindow(
  now: number,
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
): boolean {
  return isPosting(now, postWindowStart, postWindowEnd, revealTime)
}

function isSameLocalDay(a: number, b: number): boolean {
  const dateA = new Date(a)
  const dateB = new Date(b)
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

export function getChallengeLabel(
  now: number,
  postWindowStart: number,
  phase: RoundPhase,
): "Today's challenge" | "Yesterday's challenge" {
  if (phase === 'before_open' && !isSameLocalDay(now, postWindowStart)) {
    return "Yesterday's challenge"
  }
  return "Today's challenge"
}
