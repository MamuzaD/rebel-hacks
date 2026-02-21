import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'

import { Marquee } from '../ui/marquee'
import ClerkHeader from './clerk'

export default function Header() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col shadow-lg backdrop-blur-lg"
    >
      <div className="relative w-full overflow-hidden border-b border-border/50 bg-primary">
        <Marquee
          // pauseOnHover
          className="py-2 text-sm font-black text-foreground [--duration:3s] font-sans"
        >
          <span>Rebel Hacks 2026</span>
          <span>Bluff</span>
          <span>Call out your friends</span>
          <span>Is Vegas all that?</span>
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-linear-to-r from-primary to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-linear-to-l from-primary to-transparent" />
      </div>

      <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto py-4 px-6 md:px-16px-6 md:px-32">
        <h1
          className="
          font-heading-display
          italic
          text-4xl
          md:text-6xl font-semibold tracking-tigher"
        >
          <Link to="/">Bluff</Link>
        </h1>

        <ClerkHeader />
      </div>
    </motion.header>
  )
}
