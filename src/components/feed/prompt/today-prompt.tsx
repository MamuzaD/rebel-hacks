import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Separator } from '@/components/ui/separator'
import type { RoundSchedule } from '@/hooks/use-prompt-schedule'
import { usePromptSchedule } from '@/hooks/use-prompt-schedule'

import { JokerBubble } from './joker-bubble'
import { TodayPromptPortalContent } from './today-prompt-portal-content'

export type { RoundSchedule }

export type FloatingHeaderOverride = {
  challengeLabel: string
  prompt: string
  statusLine: string
}

interface TodayPromptProps {
  prompt: string
  /** When provided (e.g. from backend), used instead of computing from schedule. */
  statusLine?: string | null
  /** When provided (e.g. from backend), used instead of computing from schedule. */
  challengeLabel?: string | null
  schedule?: RoundSchedule | null
  action?: ReactNode
  /** When provided, the floating header shows this instead of the main prompt (e.g. scroll-synced section). */
  floatingHeaderOverride?: FloatingHeaderOverride | null
}

export function TodayPrompt({
  prompt,
  statusLine: statusLineProp,
  challengeLabel: challengeLabelProp,
  schedule,
  action,
  floatingHeaderOverride,
}: TodayPromptProps) {
  const challengeRef = useRef<HTMLElement | null>(null)
  const [isChallengeVisible, setIsChallengeVisible] = useState(true)
  const scheduleDerived = usePromptSchedule(
    statusLineProp != null && challengeLabelProp != null ? null : schedule,
  )
  const statusLine = statusLineProp ?? scheduleDerived.statusLine
  const challengeLabel = challengeLabelProp ?? scheduleDerived.challengeLabel

  const portalLabel = floatingHeaderOverride?.challengeLabel ?? challengeLabel
  const portalPrompt = floatingHeaderOverride?.prompt ?? prompt
  const portalStatusLine = floatingHeaderOverride?.statusLine ?? statusLine

  useEffect(() => {
    const challengeEl = challengeRef.current
    if (!challengeEl) return

    if (typeof IntersectionObserver === 'undefined') {
      const onScroll = () => {
        const rect = challengeEl.getBoundingClientRect()
        setIsChallengeVisible(rect.bottom > 128)
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsChallengeVisible(entry.isIntersecting)
      },
      {
        rootMargin: '-128px 0px 0px 0px',
        threshold: 0,
      },
    )

    observer.observe(challengeEl)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {!isChallengeVisible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-x-0 top-12 z-60 flex justify-center"
        >
          <TodayPromptPortalContent
            challengeLabel={portalLabel}
            prompt={portalPrompt}
            statusLine={portalStatusLine}
          />
        </motion.div>
      )}

      <section
        ref={challengeRef}
        className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-primary/20 bg-card p-4 shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_12%,transparent)]"
      >
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_18%,transparent)_0%,transparent_70%)]" />
        <div className="relative flex items-center gap-3">
          <JokerBubble className="size-12 shrink-0 text-xl self-center" />
          <Separator orientation="vertical" className="shrink-0 self-stretch" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[color-mix(in_oklch,var(--primary)_75%,white)]">
              {challengeLabel}
            </p>
            <p className="mt-0.5 font-medium leading-snug">{prompt}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{statusLine}</p>
          </div>
          {action != null && (
            <>
              <Separator orientation="vertical" className="shrink-0 self-stretch" />
              {action}
            </>
          )}
        </div>
      </section>
    </>
  )
}
