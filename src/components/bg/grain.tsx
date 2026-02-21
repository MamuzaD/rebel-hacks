import { useTheme } from '@/components/theme/provider'
import { GrainGradient } from '@paper-design/shaders-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export function Grain() {
  const { resolvedTheme } = useTheme()
  const shouldReduceMotion = useReducedMotion()
  const [randomOffsetX] = useState(() => Math.random() * 2 - 1)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true)

      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false)
      }, 140)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[-1]
        opacity-90
        mask-[radial-gradient(ellipse_75%_40%_at_50%_100%,white_0%,white_20%,transparent_90%)]"
      aria-hidden
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <GrainGradient
        width="100%"
        height="100%"
        colors={['#eb003fc7', '#99003f', '#eb003f', '#cb1561ed']}
        colorBack={resolvedTheme === 'dark' ? '#000000' : '#e3e3e3'}
        softness={0.85}
        intensity={2}
        noise={1}
        shape="wave"
        speed={shouldReduceMotion || isScrolling ? 0 : 3.0}
        scale={0.48}
        offsetX={randomOffsetX}
        offsetY={0.3}
      />
    </motion.div>
  )
}
