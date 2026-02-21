import { Iphone } from '@/components/ui/phone'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { BluffOrTruthStage } from './bluff-or-truth-stage'
import { PromptStage } from './prompt-stage'
import { RevealStage } from './reveal-stage'
import {
  CHIPS_LOSE,
  CHIPS_WIN,
  DEMO_POSTS,
  FLYOUT_DURATION,
  FLYOUT_EASE,
  REVEAL_STAGE,
  STAGE_DURATIONS,
} from './constants'
import { BatteryIcon } from './battery-icon'
import type { Stage } from './types'

const COMPLETED_PLAYS_BEFORE_LOCK = 3
/** Logo visible ~1s after hero fade-in; hero has delay 0.2s so total from mount = 1200ms */
const INITIAL_LOGO_DURATION_MS = 1200
const LOCKED_LOGO_SRC = '/apple-touch-icon.png'

function useCurrentTime() {
  const fmt = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export function HeroDemo() {
  const time = useCurrentTime()
  const shouldReduceMotion = useReducedMotion() ?? false
  const [stage, setStage] = useState<Stage>('prompt')
  const [photoIndex, setPhotoIndex] = useState(0)
  const [playCount, setPlayCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [hasSplashEnded, setHasSplashEnded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHasSplashEnded(true), INITIAL_LOGO_DURATION_MS)
    return () => clearTimeout(t)
  }, [])
  const [actualWasTruth, setActualWasTruth] = useState(true)
  const [userVote, setUserVote] = useState<boolean | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [totalChips, setTotalChips] = useState(0)
  const hintAnimatedRef = useRef(false)

  const x = useMotionValue(0)
  const userCorrect = userVote !== null && userVote === actualWasTruth

  useEffect(() => {
    if (!hasSplashEnded || isLocked || stage === 'bluffOrTruth') return

    const t = setTimeout(() => {
      if (stage === 'prompt') {
        setActualWasTruth(DEMO_POSTS[photoIndex % DEMO_POSTS.length].isTruth)
        setStage('bluffOrTruth')
        hintAnimatedRef.current = false
      } else {
        const nextPlayCount = playCount + 1
        if (nextPlayCount >= COMPLETED_PLAYS_BEFORE_LOCK) {
          setIsLocked(true)
        } else {
          setPlayCount(nextPlayCount)
          setPhotoIndex((p) => p + 1)
          setUserVote(null)
          x.set(0)
          setStage('prompt')
        }
      }
    }, STAGE_DURATIONS[stage])

    return () => clearTimeout(t)
  }, [hasSplashEnded, isLocked, photoIndex, playCount, stage, x])

  const commitVote = (truth: boolean) => {
    setUserVote(truth)
    const post = DEMO_POSTS[photoIndex % DEMO_POSTS.length]
    setActualWasTruth(post.isTruth)
    setTotalChips((prev) =>
      prev + (truth === post.isTruth ? CHIPS_WIN : -CHIPS_LOSE)
    )
    setStage('reveal')
  }

  const handleVote = async (truth: boolean) => {
    if (isVoting) return
    setIsVoting(true)
    await animate(x, truth ? 520 : -520, {
      duration: FLYOUT_DURATION,
      ease: FLYOUT_EASE,
    })
    commitVote(truth)
    x.set(0)
    setIsVoting(false)
  }

  return (
    <Iphone
      style={{ height: 'min(560px, 76vh)', width: 'auto' }}
      className="mx-auto block"
    >
      <div className="pointer-events-auto flex size-full flex-col overflow-hidden select-none">
        <div
          className="flex h-8 w-full shrink-0 items-center justify-between bg-black px-7 pt-1 shadow-[0_20px_40px_-4px_rgba(0,0,0,0.8)]"
          aria-hidden
        >
          <span className="text-[11px] font-semibold tabular-nums text-white">
            {time}
          </span>
          <BatteryIcon />
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden bg-zinc-950 p-16">
          {isLocked || !hasSplashEnded ? (
            <AnimatePresence>
              <motion.div
                key="locked-logo"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, delay: 0.45 }}
                className="flex flex-col gap-4 size-full items-center justify-center"
              >
                <img
                  src={LOCKED_LOGO_SRC}
                  alt=""
                  className="h-20 w-auto rounded-lg object-contain"
                />
                <span className="text-white text-4xl font-bold font-heading-display italic">Bluff</span>
                {isLocked && (
                  <div className="flex flex-col items-center gap-0.5 pt-2">
                    <span
                      className={`text-2xl font-black tabular-nums ${
                        totalChips >= 0 ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {totalChips >= 0 ? '+' : ''}{totalChips}
                    </span>
                    <span className="text-sm font-semibold text-white/35">
                      {REVEAL_STAGE.chipsLabel}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              {stage === 'prompt' && <PromptStage photoIndex={photoIndex} />}
              {stage === 'bluffOrTruth' && (
                <BluffOrTruthStage
                  photoIndex={photoIndex}
                  isVoting={isVoting}
                  onVote={handleVote}
                  x={x}
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                  hintAnimatedRef={hintAnimatedRef}
                  shouldReduceMotion={shouldReduceMotion}
                />
              )}
              {stage === 'reveal' && (
                <RevealStage
                  actualWasTruth={actualWasTruth}
                  userVote={userVote}
                  userCorrect={userCorrect}
                />
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </Iphone>
  )
}
