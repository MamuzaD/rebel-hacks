import { useTheme } from '@/components/theme/provider'
import { GrainGradient } from '@paper-design/shaders-react'
import { motion, useReducedMotion } from 'motion/react'

export function Grain() {
  const { resolvedTheme } = useTheme()
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 z-0
        opacity-90
        mask-[radial-gradient(ellipse_45%_40%_at_50%_100%,white_0%,white_20%,transparent_90%)]"
      aria-hidden
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <GrainGradient
        width={1280}
        height={1280}
        colors={['#eb003fc7', '#99003f', '#eb003f', '#cb1561ed']}
        colorBack={resolvedTheme === 'dark' ? '#000000' : '#e3e3e3'}
        softness={0.85}
        intensity={1}
        noise={1}
        shape="wave"
        speed={3.0}
        scale={0.48}
        offsetY={0.38}
      />
    </motion.div>
  )
}
