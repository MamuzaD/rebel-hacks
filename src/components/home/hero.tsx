import { Button } from '@/components/ui/button'
import { SUBTITLE_TEXTS } from '@/constants/hero'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { StripedPattern } from '../bg/striped'
import { HeroDemo } from './demo'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  none: { opacity: 1, y: 0 },
}

const fadeFromLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0 },
  none: { opacity: 1, x: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  none: { transition: { staggerChildren: 0, delayChildren: 0 } },
}

export function Hero() {
  const [subtitle] = useState(
    () => SUBTITLE_TEXTS[Math.floor(Math.random() * SUBTITLE_TEXTS.length)],
  )
  const shouldReduceMotion = useReducedMotion()
  const reduced = Boolean(shouldReduceMotion)
  const leftVariants = reduced
    ? { hidden: fadeFromLeft.none, visible: fadeFromLeft.none }
    : fadeFromLeft
  const containerVariants = reduced
    ? { hidden: {}, visible: stagger.none }
    : { hidden: stagger.hidden, visible: stagger.visible }

  return (
    <motion.section
      className="relative min-h-[85vh] overflow-hidden grid grid-cols-1 md:grid-cols-2 px-6 md:px-16"
      initial={reduced ? false : 'hidden'}
      animate={reduced ? false : 'visible'}
      variants={{ hidden: fadeUp.hidden, visible: fadeUp.visible }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <StripedPattern
        direction="left"
        width={20}
        height={10}
        className="text-primary/90 mask-[radial-gradient(ellipse_70%_60%_at_50%_50%,white_0%,white_20%,transparent_70%)] absolute inset-0 z-0"
      />

      {/* left */}
      <motion.div
        className="relative flex flex-col gap-4 justify-center h-full py-20 z-10 max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-5xl md:text-8xl font-black leading-tight"
          variants={leftVariants}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Put your{' '}
          <motion.span
            className="text-primary"
            animate={
              shouldReduceMotion
                ? { textShadow: '0 0 20px rgba(220,0,40,0.9)' }
                : {
                    textShadow: [
                      '0 0 0px rgba(180,0,60,0)',
                      '0 0 20px rgba(220,0,40,0.9)',
                      '0 0 35px rgba(255,0,70,0.5)',
                      '0 0 20px rgba(220,0,30,0.9)',
                      '0 0 0px rgba(180,0,60,0)',
                    ],
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    duration: 2.8,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                  }
            }
          >
            night
          </motion.span>
          <br /> on the table.
        </motion.h1>
        <motion.h2
          className="text-xl md:text-3xl font-semibold"
          variants={leftVariants}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          1 photo. 1 claim. <br /> {subtitle}
        </motion.h2>
        <motion.div
          className="mt-6 flex gap-4"
          variants={leftVariants}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Button>update this button</Button>
          <Button variant="outline">update this button</Button>
        </motion.div>
      </motion.div>

      {/* right */}
      <motion.div
        className="relative hidden md:flex items-center justify-center h-full py-20 z-20 overflow-hidden"
        initial={reduced ? false : { opacity: 0, x: 32 }}
        animate={reduced ? undefined : { opacity: 1, x: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        <HeroDemo />
      </motion.div>
    </motion.section>
  )
}
