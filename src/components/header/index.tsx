import { Link, useRouterState } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'

import { Button } from '@/components/ui/button'

import { useAuth } from '@clerk/clerk-react'
import { LayoutListIcon } from 'lucide-react'
import { Marquee } from './marquee'
import ClerkHeader from './user'

export default function Header() {
  const { isSignedIn } = useAuth()
  const shouldReduceMotion = useReducedMotion()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isHome = pathname === '/'

  return (
    <motion.header
      initial={shouldReduceMotion ? { opacity: 1 } : { y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col shadow-lg backdrop-blur-lg"
    >
      <Marquee />

      <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto px-6 py-4 md:px-16 lg:px-32">
        <h1
          className="
          font-heading-display
          italic
          text-4xl
          md:text-6xl font-semibold tracking-tigher"
        >
          <Link to="/" className="select-none">
            Bluff
          </Link>
        </h1>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <Link to="/feed">
              <Button className="inline-flex gap-4 px-6">
                <LayoutListIcon />
                Feed
              </Button>
            </Link>
          ) : null}

          <ClerkHeader />
        </div>
      </div>
    </motion.header>
  )
}
