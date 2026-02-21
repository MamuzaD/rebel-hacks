/**
 * Round schedule in America/Los_Angeles (Vegas).
 * A = postWindowStart (6–10pm LA): posting and voting open.
 * B = postWindowEnd (A + 4h): posting closes, voting still open.
 * C = revealTime = next round's A: voting closes, reveal/settlement runs.
 * Uses PST (UTC-8); DST can be refined later.
 */

export const POST_WINDOW_DURATION_MS = 4 * 60 * 60 * 1000

/** Time after posting closes during which users can vote; reveal/settlement runs at postWindowEnd + this. */
export const VOTING_WINDOW_DURATION_MS = 24 * 60 * 60 * 1000

function getDatePartsLA(date: Date): {
  year: number
  month: number
  day: number
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(date)
  const year = Number(parts.find((part) => part.type === 'year')?.value ?? '0')
  const month = Number(parts.find((part) => part.type === 'month')?.value ?? '0')
  const day = Number(parts.find((part) => part.type === 'day')?.value ?? '0')
  return { year, month, day }
}

function toDateString({ year, month, day }: { year: number; month: number; day: number }): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Get date string (YYYY-MM-DD) in LA, with optional day offset from now. */
export function getDateStringLA(offsetDays = 0): string {
  const now = new Date()
  const nowParts = getDatePartsLA(now)
  const noonUtc = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day, 12, 0, 0, 0)
  const target = new Date(noonUtc + offsetDays * 24 * 60 * 60 * 1000)
  return toDateString(getDatePartsLA(target))
}

/** Get today's date string (YYYY-MM-DD) in LA */
export function getTodayDateStringLA(): string {
  return getDateStringLA(0)
}

/** Next calendar day (YYYY-MM-DD). Used so a prompt's revealTime = next round's postWindowStart. */
export function getNextDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  const year = next.getUTCFullYear()
  const month = next.getUTCMonth() + 1
  const day = next.getUTCDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Previous calendar day (YYYY-MM-DD). Used to backfill previous prompt's revealTime when creating a new round. */
export function getPreviousDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const prev = new Date(Date.UTC(y, m - 1, d - 1))
  const year = prev.getUTCFullYear()
  const month = prev.getUTCMonth() + 1
  const day = prev.getUTCDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Max duration (1h) below which we treat the window as intentional (e.g. dev 2-min) and do not extend. */
const SHORT_WINDOW_MS = 60 * 60 * 1000

/**
 * Normalize a round schedule to current product rules. This preserves compatibility
 * with older prompts that may still have shorter windows persisted.
 * Reveal time is after the voting window (postWindowEnd + voting window).
 * Short windows (≤1h) are left as-is for dev; we still ensure revealTime >= postWindowEnd.
 */
export function normalizeRoundTimestamps(
  postWindowStart: number,
  postWindowEnd: number,
  revealTime: number,
): {
  postWindowStart: number
  postWindowEnd: number
  revealTime: number
} {
  const duration = postWindowEnd - postWindowStart
  if (duration <= SHORT_WINDOW_MS) {
    const minReveal = Math.max(revealTime, postWindowEnd)
    return { postWindowStart, postWindowEnd, revealTime: minReveal }
  }
  const normalizedPostWindowEnd = Math.max(postWindowEnd, postWindowStart + POST_WINDOW_DURATION_MS)
  // Reveal is when voting closes (usually next round's start); only ensure it's after posting ends.
  const normalizedRevealTime = Math.max(revealTime, normalizedPostWindowEnd)
  return {
    postWindowStart,
    postWindowEnd: normalizedPostWindowEnd,
    revealTime: normalizedRevealTime,
  }
}

/**
 * For date YYYY-MM-DD in LA, return UTC timestamps (PST = UTC-8):
 * - postWindowStart (time A): random 6–10pm LA; posting and voting open
 * - postWindowEnd (time B): posting closes
 * - revealTime (time C): when voting closes = next round's postWindowStart (fallback: postWindowEnd + voting window)
 */
export function getRoundTimestamps(
  dateStr: string,
  nextRoundStartMs?: number,
): {
  postWindowStart: number
  postWindowEnd: number
  revealTime: number
} {
  const [y, m, d] = dateStr.split('-').map(Number)
  const monthIndex = m - 1
  const minutesAfter6pm = Math.floor(Math.random() * (4 * 60 + 1))
  const hourLA = 18 + Math.floor(minutesAfter6pm / 60)
  const minuteLA = minutesAfter6pm % 60
  const postWindowStart = Date.UTC(y, monthIndex, d, hourLA + 8, minuteLA, 0, 0)
  const postWindowEnd = postWindowStart + POST_WINDOW_DURATION_MS
  const revealTime = nextRoundStartMs ?? postWindowEnd + VOTING_WINDOW_DURATION_MS
  return { postWindowStart, postWindowEnd, revealTime }
}
