import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ProfileStatProps = {
  value: string | number
  label: string
  icon?: ReactNode
  interactive?: boolean
  onClick?: () => void
}

export function ProfileStat({
  value,
  label,
  icon,
  interactive = false,
  onClick,
}: ProfileStatProps) {
  const Comp = interactive ? 'button' : 'div'
  return (
    <Comp
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
      className={cn(
        'rounded-xl border border-border bg-card/60 px-2 py-2.5',
        interactive &&
          'cursor-pointer transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
    >
      <p className="inline-flex items-center justify-center gap-1 text-sm font-semibold tabular-nums text-foreground">
        {icon}
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Comp>
  )
}
