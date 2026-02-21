import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { createPortal } from 'react-dom'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface TodayPromptProps {
  prompt: string
}

const JOKER_BUBBLE_STYLE =
  'flex shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_22%,transparent)_0%,transparent_70%)] shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_28%,transparent)]'

export function JokerBubble({ className }: { className?: string }) {
  return (
    <div className={cn(JOKER_BUBBLE_STYLE, className)}>
      🃏
    </div>
  )
}

function TodayPromptPortalContent({ prompt }: { prompt: string }) {
  return (
    <div className="relative max-w-[min(92vw,44rem)] overflow-hidden rounded-xl border border-primary/20 bg-card/95 shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_12%,transparent)] backdrop-blur">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_18%,transparent)_0%,transparent_70%)]"
      />
      <div className="relative flex items-center gap-2 px-3 py-2">
        <JokerBubble className="size-8 text-base shadow-[0_0_16px_color-mix(in_oklch,var(--primary)_28%,transparent)]" />
        <Separator orientation="vertical" />
        <div className="min-w-0 flex-1 max-w-[40ch] text-left">
          <p
            className="text-[10px] font-semibold uppercase tracking-wider text-[color-mix(in_oklch,var(--primary)_75%,white)]"
          >
            Today&apos;s challenge
          </p>
          <p className="truncate text-sm font-medium">{prompt}</p>
        </div>
      </div>
    </div>
  )
}

export function TodayPrompt({ prompt }: TodayPromptProps) {
  const challengeRef = useRef<HTMLElement | null>(null)
  const [isChallengeVisible, setIsChallengeVisible] = useState(true)

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
        // Header is fixed, so offset the top intersection line to match it.
        rootMargin: '-128px 0px 0px 0px',
        threshold: 0,
      },
    )

    observer.observe(challengeEl)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {!isChallengeVisible && typeof document !== 'undefined'
        ? createPortal(
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="pointer-events-none fixed inset-x-0 top-5 z-80 flex h-32 items-center justify-center"
            >
              <TodayPromptPortalContent prompt={prompt} />
            </motion.div>,
            document.body,
          )
        : null}

      <section
        ref={challengeRef}
        className="relative overflow-hidden rounded-xl border border-primary/20 bg-card p-4 shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_12%,transparent)]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_18%,transparent)_0%,transparent_70%)]"
        />
        <div className="relative flex items-start gap-3">
          <JokerBubble className="size-10 text-xl" />
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold uppercase tracking-wider text-[color-mix(in_oklch,var(--primary)_75%,white)]"
            >
              Today&apos;s challenge
            </p>
            <p className="mt-1 font-medium">{prompt}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Vote until reveal · Next reveal in 8h
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
