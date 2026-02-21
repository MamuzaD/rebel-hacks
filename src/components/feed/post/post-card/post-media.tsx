import type { PostCardData } from '@/components/feed/post'
import type { useSwipeVote } from '@/components/feed/post/post-card/use-swipe-vote'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

type SwipeVoteState = ReturnType<typeof useSwipeVote>

type PostMediaProps = {
  post: PostCardData
  swipe: SwipeVoteState
  canSwipeVote: boolean
}

export function PostMedia({ post, swipe, canSwipeVote }: PostMediaProps) {
  const { swipeX, swipeRotate, truthOpacity, bluffOpacity, isDragging, handlers } = swipe

  return (
    <div
      {...handlers}
      className={cn(
        'overflow-x-hidden touch-pan-y select-none',
        canSwipeVote && (isDragging ? 'cursor-grabbing' : 'cursor-grab'),
      )}
    >
      <motion.div style={{ x: swipeX, rotate: swipeRotate }}>
        <div className="relative mx-3 aspect-square overflow-hidden rounded-xl">
          <img
            src={post.imageUrl}
            alt=""
            draggable={false}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-card/90 via-card/40 to-transparent" />
          {!post.isRevealed && (
            <>
              <motion.div
                className="pointer-events-none absolute inset-3 flex items-start justify-start p-4"
                style={{ opacity: truthOpacity }}
              >
                <span className="-rotate-12 rounded-md border-2 border-success bg-success/10 px-3 py-2 text-5xl font-bold uppercase tracking-wide text-success">
                  Truth
                </span>
              </motion.div>
              <motion.div
                className="pointer-events-none absolute inset-3 flex items-start justify-end p-4"
                style={{ opacity: bluffOpacity }}
              >
                <span className="rotate-12 rounded-md border-2 border-destructive bg-destructive/10 px-3 py-2 text-5xl font-bold uppercase tracking-wide text-destructive">
                  Bluff
                </span>
              </motion.div>
            </>
          )}
        </div>

        {(post.caption || post.location) && (
          <div className="space-y-1 px-4 pt-3">
            {post.location && (
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {post.location}
              </p>
            )}
            {post.caption && (
              <p className="text-[15px] font-semibold leading-snug text-foreground">
                &ldquo;{post.caption}&rdquo;
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
