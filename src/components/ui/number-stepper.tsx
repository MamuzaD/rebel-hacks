import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type NumberStepperProps = {
  /** Current value (must be one of the values in `options`) */
  value: number
  /** Allowed values in order (e.g. [10, 25, 50, 100]). − / + step through these. */
  options: readonly number[]
  onChange: (value: number) => void
  /** Content between minus and plus (e.g. label + value) */
  children: ReactNode
  /** Wrapper className (e.g. for border/background when selected) */
  className?: string
  /** ClassName for the − and + buttons */
  buttonClassName?: string
  decrementLabel?: string
  incrementLabel?: string
}

export function NumberStepper({
  value,
  options,
  onChange,
  children,
  className,
  buttonClassName,
  decrementLabel = 'Decrease',
  incrementLabel = 'Increase',
}: NumberStepperProps) {
  const idx = options.indexOf(value)
  const canDecrement = idx > 0
  const canIncrement = idx >= 0 && idx < options.length - 1

  const decrement = () => {
    if (canDecrement) onChange(options[idx - 1])
  }
  const increment = () => {
    if (canIncrement) onChange(options[idx + 1])
  }

  const btnClass = cn(
    'flex size-8 shrink-0 items-center justify-center rounded-lg text-lg font-medium tabular-nums transition-colors hover:bg-black/10 disabled:opacity-30 disabled:pointer-events-none',
    buttonClassName,
  )

  return (
    <div className={cn('flex w-full items-center gap-1', className)}>
      <button
        type="button"
        aria-label={decrementLabel}
        className={btnClass}
        onClick={(e) => {
          e.stopPropagation()
          decrement()
        }}
        disabled={!canDecrement}
      >
        −
      </button>
      <div className="flex min-w-0 flex-1 items-center justify-center">{children}</div>
      <button
        type="button"
        aria-label={incrementLabel}
        className={btnClass}
        onClick={(e) => {
          e.stopPropagation()
          increment()
        }}
        disabled={!canIncrement}
      >
        +
      </button>
    </div>
  )
}
