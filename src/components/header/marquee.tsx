import { Marquee as MagicMarquee } from '@/components/ui/marquee'

export function Marquee() {
  return (
    <div className="relative w-full overflow-hidden border-b border-border/50 bg-primary">
      <MagicMarquee
        // pauseOnHover
        className="py-2 text-sm font-black text-foreground [--duration:5s] font-sans"
      >
        <span>Rebel Hacks 2026</span>
        <span>Bluff</span>
        <span>Call out your friends</span>
        <span>Is Vegas all that?</span>
      </MagicMarquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-linear-to-r from-primary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-linear-to-l from-primary to-transparent" />
    </div>
  )
}
