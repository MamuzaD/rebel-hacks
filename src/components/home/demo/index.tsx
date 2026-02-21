import { Iphone } from '@/components/ui/phone'
import {
  AnimatePresence,
  animate,
  useMotionValue,
  useReducedMotion,
} from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BluffOrTruthStage } from './bluff-or-truth-stage'
import { PromptStage } from './prompt-stage'
import { RevealStage } from './reveal-stage'
import {
  FLYOUT_DURATION,
  FLYOUT_EASE,
  STAGE_DURATIONS,
} from './constants'
import type { Stage } from './types'

export function HeroDemo() {
  const shouldReduceMotion = useReducedMotion() ?? false
  const [stage, setStage] = useState<Stage>('prompt')
  const [photoIndex, setPhotoIndex] = useState(0)
  const [actualWasTruth, setActualWasTruth] = useState(true)
  const [userVote, setUserVote] = useState<boolean | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const hintAnimatedRef = useRef(false)

  const x = useMotionValue(0)
  const userCorrect = userVote !== null && userVote === actualWasTruth

  useEffect(() => {
    if (stage === 'bluffOrTruth') return

    const t = setTimeout(() => {
      if (stage === 'prompt') {
        setActualWasTruth(photoIndex % 2 === 0)
        setStage('bluffOrTruth')
        hintAnimatedRef.current = false
      } else {
        setPhotoIndex((p) => p + 1)
        setUserVote(null)
        x.set(0)
        setStage('prompt')
      }
    }, STAGE_DURATIONS[stage])

    return () => clearTimeout(t)
  }, [photoIndex, stage, x])

  const commitVote = (truth: boolean) => {
    setUserVote(truth)
    setActualWasTruth(photoIndex % 2 === 0)
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
      <div className="pointer-events-auto flex size-full flex-col overflow-hidden">
        <div
          className="aria-hidden h-8 w-full shrink-0 bg-black shadow-[0_20px_40px_-4px_rgba(0,0,0,0.8)]"
          aria-hidden
        />
        <div className="relative min-h-0 flex-1 overflow-hidden bg-zinc-950 p-16">
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
        </div>
      </div>
    </Iphone>
  )
}
