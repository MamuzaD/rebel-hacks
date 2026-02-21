import { getRoundPhase } from '@/lib/round-status'
import { useEffect, useState } from 'react'

export type RoundSchedule = {
  postWindowStart: number
  postWindowEnd: number
  revealTime: number
}

const DEFAULT_STATUS_LINE = 'Vote and bet on the feed'

function isSameLocalDay(a: number, b: number): boolean {
  const dateA = new Date(a)
  const dateB = new Date(b)
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

/**
 * Provides challengeLabel (and a default statusLine) when schedule is set but
 * backend status isn't (e.g. legacy or non-feed usage). Status line is
 * normally provided by the backend via getActive.
 */
export function usePromptSchedule(schedule: RoundSchedule | null | undefined): {
  now: number
  statusLine: string
  challengeLabel: string
} {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (schedule == null) return
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [schedule])

  const challengeLabel =
    schedule != null &&
    getRoundPhase(now, schedule.postWindowStart, schedule.postWindowEnd, schedule.revealTime) ===
      'before_open' &&
    !isSameLocalDay(now, schedule.postWindowStart)
      ? "Yesterday's challenge"
      : "Today's challenge"

  return {
    now,
    statusLine: DEFAULT_STATUS_LINE,
    challengeLabel,
  }
}
