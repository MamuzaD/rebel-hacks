import { formatTimeLocal, timeUntil } from '@/lib/time'
import { useEffect, useState } from 'react'

export type StatusKind = 'previous_finished' | 'posting_begun' | 'posting_opens'

type Payload = {
  kind: StatusKind
  statusTimeMs?: number
  postingEndsAt?: number
}

function buildLine(payload: Payload, now: number): string {
  if (payload.kind === 'posting_begun' && payload.postingEndsAt != null) {
    return `Posting has begun, ends ${timeUntil(payload.postingEndsAt, now)}`
  }
  if (payload.kind === 'previous_finished' && payload.statusTimeMs != null) {
    return `Previous posting finished at ${formatTimeLocal(payload.statusTimeMs)}`
  }
  if (payload.kind === 'posting_opens') {
    return 'Vote and bet on the feed'
  }
  return 'Vote and bet on the feed'
}

/**
 * Builds status line from backend payload using the user's local timezone.
 * Updates every minute when kind is posting_begun so "in 2h" stays accurate.
 */
export function useStatusLineFromPayload(payload: Payload | null | undefined): string {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (payload?.kind !== 'posting_begun') return
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [payload?.kind])

  if (payload == null) return 'Vote and bet on the feed'
  return buildLine(payload, now)
}
