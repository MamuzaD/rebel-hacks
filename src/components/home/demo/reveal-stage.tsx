import {
  randomRevealFailureMessage,
  randomRevealSuccessMessage,
} from '@/constants/messages'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { CHIPS_LOSE, CHIPS_WIN, REVEAL_STAGE } from './constants'

interface RevealStageProps {
  actualWasTruth: boolean
  userVote: boolean | null
  userCorrect: boolean
}

export function RevealStage({
  actualWasTruth,
  userVote,
  userCorrect,
}: RevealStageProps) {
  const shouldReduceMotion = useReducedMotion()
  const noMotion = { duration: 0 }
  const resultMessage = useMemo(
    () =>
      userVote === null
        ? ''
        : userCorrect
          ? randomRevealSuccessMessage()
          : randomRevealFailureMessage(),
    [userCorrect, userVote],
  )

  return (
    <motion.div
      key="reveal"
      className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-zinc-950 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      {userVote !== null && (
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { scale: 0.5, opacity: 0 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { scale: 1, opacity: 1 }
          }
          transition={
            shouldReduceMotion
              ? noMotion
              : { type: 'spring', stiffness: 400, damping: 22 }
          }
        >
          <div
            className={`flex size-14 items-center justify-center rounded-full ${userCorrect ? 'bg-success/15' : 'bg-destructive/15'}`}
            style={{
              boxShadow: userCorrect
                ? '0 0 32px oklch(from var(--success) l c h / 0.3)'
                : '0 0 32px oklch(from var(--destructive) l c h / 0.3)',
            }}
          >
            {userCorrect ? (
              <svg viewBox="0 0 24 24" className="size-8 text-success" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={shouldReduceMotion ? noMotion : { delay: 0.15, duration: 0.35, ease: 'easeOut' }}
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-8 text-destructive" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M18 6L6 18"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={shouldReduceMotion ? noMotion : { delay: 0.1, duration: 0.2, ease: 'easeOut' }}
                />
                <motion.path
                  d="M6 6l12 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={shouldReduceMotion ? noMotion : { delay: 0.2, duration: 0.2, ease: 'easeOut' }}
                />
              </svg>
            )}
          </div>
          <p
            className={`text-sm font-semibold ${userCorrect ? 'text-success' : 'text-destructive'}`}
          >
            {resultMessage}
          </p>
        </motion.div>
      )}

      <motion.div
        className={`rounded-2xl px-8 py-3 text-center border-[3px] ${actualWasTruth ? 'border-success/50' : 'border-destructive/50'}`}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={
          shouldReduceMotion
            ? noMotion
            : { delay: 0.18, duration: 0.3, ease: 'easeOut' }
        }
      >
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
          {REVEAL_STAGE.prefix}
        </p>
        <p
          className={`text-xl font-black uppercase tracking-wider ${actualWasTruth ? 'text-success' : 'text-destructive'}`}
        >
          {actualWasTruth ? REVEAL_STAGE.truthLabel : REVEAL_STAGE.bluffLabel}
        </p>
      </motion.div>

      <motion.div
        className="flex items-baseline gap-1.5"
        initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={
          shouldReduceMotion
            ? noMotion
            : {
                delay: 0.32,
                type: 'spring',
                stiffness: 340,
                damping: 18,
              }
        }
      >
        <span
          className={`text-4xl font-black tabular-nums ${userCorrect ? 'text-success' : 'text-destructive'}`}
        >
          {userCorrect ? `+${CHIPS_WIN}` : `-${CHIPS_LOSE}`}
        </span>
        <span className="text-sm font-semibold text-white/35">{REVEAL_STAGE.chipsLabel}</span>
      </motion.div>
    </motion.div>
  )
}
