import { motion, useReducedMotion } from 'motion/react'
import { DEMO_POSTS, DEMO_PROMPTS, PROMPT_STAGE } from './constants'

const fadeIn = { opacity: 0, scale: 0.97 as number }
const visible = { opacity: 1, scale: 1 as number }
const fadeOut = { opacity: 0, scale: 1.02 as number }
const transition = { duration: 0.36, ease: [0.32, 0.72, 0, 1] as const }
const noMotion = { duration: 0 }

interface PromptStageProps {
  photoIndex: number
}

export function PromptStage({ photoIndex }: PromptStageProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      key="prompt"
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 bg-zinc-950"
      initial={shouldReduceMotion ? { opacity: 0 } : fadeIn}
      animate={shouldReduceMotion ? { opacity: 1 } : visible}
      exit={shouldReduceMotion ? { opacity: 0 } : fadeOut}
      transition={shouldReduceMotion ? noMotion : transition}
    >
      {/* Glowing card icon */}
      <motion.div
        className="size-16 rounded-full flex items-center justify-center text-3xl select-none"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--primary) 18%, transparent) 0%, transparent 70%)',
          boxShadow:
            '0 0 40px color-mix(in oklch, var(--primary) 25%, transparent)',
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: [1, 1.07, 1],
                opacity: [0.85, 1, 0.85],
              }
        }
        transition={{
          duration: 2.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        🃏
      </motion.div>

      {/* Prompt text */}
      <div className="text-center space-y-3">
        <p
          className="text-[9px] font-bold uppercase tracking-[0.28em]"
          style={{
            color: 'color-mix(in oklch, var(--primary) 70%, white)',
          }}
        >
          {PROMPT_STAGE.title}
        </p>
        <p className="text-[13px] font-medium leading-snug text-white/85 italic">
          "{DEMO_PROMPTS[photoIndex % DEMO_PROMPTS.length]}"
        </p>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center gap-1.5">
        {DEMO_POSTS.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === photoIndex % DEMO_POSTS.length ? 18 : 6,
              background:
                i === photoIndex % DEMO_POSTS.length
                  ? 'var(--primary)'
                  : 'rgba(255,255,255,0.14)',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

