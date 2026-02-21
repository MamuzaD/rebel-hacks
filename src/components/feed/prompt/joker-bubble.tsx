import { cn } from '@/lib/utils'

const JOKER_BUBBLE_STYLE =
  'flex shrink-0 items-center justify-center rounded-full text-3xl hover:rotate-5 transition-transform bg-[radial-gradient(circle,color-mix(in_oklch,var(--primary)_22%,transparent)_0%,transparent_70%)] shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_28%,transparent)]'

export function JokerBubble({ className }: { className?: string }) {
  return <div className={cn(JOKER_BUBBLE_STYLE, className)}>🃏</div>
}
