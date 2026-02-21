import { Globe2, UsersRound } from 'lucide-react'
import { motion } from 'motion/react'
import type { RefObject } from 'react'
import { useEffect, useState } from 'react'

type FeedScope = 'global' | 'friends'

interface FeedScopeTabsProps {
  scope: FeedScope
  onScopeChange: (scope: FeedScope) => void
  stickyTargetRef?: RefObject<HTMLElement | null>
}

function FeedScopeTabsPill({
  scope,
  onScopeChange,
}: Pick<FeedScopeTabsProps, 'scope' | 'onScopeChange'>) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur-sm">
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          scope === 'global'
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        onClick={() => onScopeChange('global')}
      >
        <Globe2 className="size-4" />
        Global
      </button>
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          scope === 'friends'
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        onClick={() => onScopeChange('friends')}
      >
        <UsersRound className="size-4" />
        Friends
      </button>
    </div>
  )
}

export function FeedScopeTabs({ scope, onScopeChange, stickyTargetRef }: FeedScopeTabsProps) {
  const [isTargetVisible, setIsTargetVisible] = useState(true)

  useEffect(() => {
    const targetEl = stickyTargetRef?.current
    if (!targetEl) return

    if (typeof IntersectionObserver === 'undefined') {
      const onScroll = () => {
        const rect = targetEl.getBoundingClientRect()
        setIsTargetVisible(rect.bottom > 128)
      }
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTargetVisible(entry.isIntersecting)
      },
      { rootMargin: '-128px 0px 0px 0px', threshold: 0 },
    )
    observer.observe(targetEl)
    return () => observer.disconnect()
  }, [stickyTargetRef])

  return (
    <>
      {stickyTargetRef != null && !isTargetVisible ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed inset-x-0 top-28 z-65 flex justify-center"
        >
          <FeedScopeTabsPill scope={scope} onScopeChange={onScopeChange} />
        </motion.div>
      ) : null}

      <div className="flex justify-center">
        <FeedScopeTabsPill scope={scope} onScopeChange={onScopeChange} />
      </div>
    </>
  )
}
