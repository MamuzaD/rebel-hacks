import { Separator } from '@/components/ui/separator'

import { JokerBubble } from './joker-bubble'

type TodayPromptPortalContentProps = {
  challengeLabel: string
  prompt: string
  statusLine: string
}

export function TodayPromptPortalContent({
  challengeLabel,
  prompt,
  statusLine,
}: TodayPromptPortalContentProps) {
  return (
    <div className="relative max-w-[min(92vw,44rem)] overflow-hidden rounded-xl border border-primary/20 bg-card/95 shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_12%,transparent)] backdrop-blur">
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_18%,transparent)_0%,transparent_70%)]" />
      <div className="relative flex items-center gap-2 px-3 py-2">
        <JokerBubble className="size-8 text-base shadow-[0_0_16px_color-mix(in_oklch,var(--primary)_28%,transparent)]" />
        <Separator orientation="vertical" />
        <div className="min-w-0 flex-1 max-w-[40ch] text-left">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[color-mix(in_oklch,var(--primary)_75%,white)]">
            {challengeLabel}
          </p>
          <p className="truncate text-sm font-medium">{prompt}</p>
          <p className="truncate text-xs text-muted-foreground">{statusLine}</p>
        </div>
      </div>
    </div>
  )
}
