import type { ComponentPropsWithoutRef } from 'react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const defaultSeparator = (
  <span className="shrink-0 opacity-60" aria-hidden>
    {' — '}
  </span>
)

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee
   */
  children: React.ReactNode
  /**
   * Separator rendered between each child (e.g. em dash). Set to null to disable.
   * @default em dash ( — )
   */
  separator?: React.ReactNode
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  separator = defaultSeparator,
  vertical = false,
  repeat = 10,
  ...props
}: MarqueeProps) {
  const items = React.Children.toArray(children)
  const content =
    separator !== null && items.length > 1
      ? [...items.flatMap((child) => [child, separator])]
      : items

  return (
    <div
      {...props}
      className={cn(
        'group flex [gap:var(--gap)] overflow-hidden p-2 [--duration:40s] [--gap:1rem]',
        {
          'flex-row': !vertical,
          'flex-col': vertical,
        },
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, idx) => `marquee-copy-${idx + 1}`).map((copyKey) => (
        <div
          key={copyKey}
          className={cn('flex shrink-0 justify-around [gap:var(--gap)]', {
            'animate-marquee flex-row': !vertical,
            'animate-marquee-vertical flex-col': vertical,
            'group-hover:[animation-play-state:paused]': pauseOnHover,
            '[animation-direction:reverse]': reverse,
          })}
        >
          {content}
        </div>
      ))}
    </div>
  )
}
