import { JokerBubble } from '@/components/feed/prompt/joker-bubble'
import { Separator } from '@/components/ui/separator'

type ChallengeSeparatorProps = {
  promptText: string
  subtitle: string
}

export function ChallengeSeparator({ promptText, subtitle }: ChallengeSeparatorProps) {
  return (
    <div className="relative mx-auto max-w-md overflow-hidden rounded-xl border border-primary/20 bg-card p-3 shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_12%,transparent)]">
      <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent)_0%,transparent_70%)]" />
      <div className="relative flex items-start gap-3">
        <JokerBubble className="size-12 text-base self-center" />
        <Separator orientation="vertical" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color-mix(in_oklch,var(--primary)_75%,white)]">
            Challenge
          </p>
          <p className="mt-1 font-medium">{promptText}</p>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
