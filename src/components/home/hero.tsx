import { motion } from 'motion/react'
import { StripedPattern } from './striped'

export function Hero() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden grid grid-cols-1 md:grid-cols-2 px-6 md:px-16">
      <StripedPattern
        direction="left"
        width={20}
        height={10}
        className="text-primary/90 mask-[radial-gradient(ellipse_85%_60%_at_50%_50%,white_0%,white_20%,transparent_70%)] absolute inset-0 z-0"
      />

      {/* left */}
      <div className="relative flex flex-col gap-4 justify-center h-full py-20 z-10 max-w-2xl">
        <h1 className="text-5xl md:text-8xl font-black leading-tight">
          Put your{' '}
          <motion.span
            className="text-primary"
            animate={{
              textShadow: [
                '0 0 0px rgba(180,0,60,0)',
                '0 0 20px rgba(220,0,40,0.9)',
                '0 0 35px rgba(255,0,70,0.5)',
                '0 0 20px rgba(220,0,30,0.9)',
                '0 0 0px rgba(180,0,60,0)',
              ],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          >
            night
          </motion.span>
          <br /> on the table.
        </h1>
        <h2 className="text-xl md:text-3xl font-semibold">
          1 photo. 1 claim. <br /> Truth or bluff. Can your friends call it?
        </h2>
        <div className="mt-6 flex gap-4">
          <button className="px-6 py-3 bg-primary text-white rounded-lg hover:scale-105 transition-transform">
            Join a Circle
          </button>
          <button className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition">
            Create a Circle
          </button>
        </div>
      </div>

      {/* right */}
      <div className="relative flex items-center justify-center h-full py-20 z-20"></div>
    </section>
  )
}
