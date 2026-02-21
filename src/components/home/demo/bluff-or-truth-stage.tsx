import { animate, motion, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useSwipeable } from 'react-swipeable'
import type { MotionValue } from 'motion'
import type { MutableRefObject } from 'react'
import {
  BLUFF_OR_TRUTH_STAGE,
  DEMO_POSTS,
  SNAP_SPRING,
  SWIPE_THRESHOLD,
} from './constants'
import type { IPostData } from './types'

interface BluffOrTruthStageProps {
  photoIndex: number
  isVoting: boolean
  onVote: (truth: boolean) => void
  x: MotionValue<number>
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
  hintAnimatedRef: MutableRefObject<boolean>
  shouldReduceMotion: boolean
}

export function BluffOrTruthStage({
  photoIndex,
  isVoting,
  onVote,
  x,
  isDragging,
  setIsDragging,
  hintAnimatedRef,
  shouldReduceMotion,
}: BluffOrTruthStageProps) {
  const post: IPostData = DEMO_POSTS[photoIndex % DEMO_POSTS.length]

  // Pivot from ~90% down the card — feels like tossing a card from your hand
  const rotate = useTransform(x, [-260, 260], [-14, 14])
  const truthOpacity = useTransform(x, [20, 80], [0, 1])
  const bluffOpacity = useTransform(x, [-80, -20], [1, 0])
  // Subtle green/red tint on the background as you drag
  const bgGreenOpacity = useTransform(x, [0, 120], [0, 0.18])
  const bgRedOpacity = useTransform(x, [-120, 0], [0.18, 0])

  const isSwipingRef = useRef(false)

  // Smooth swipe hint — uses animate() so it feels natural
  useEffect(() => {
    if (shouldReduceMotion || hintAnimatedRef.current) return
    const t = setTimeout(async () => {
      if (hintAnimatedRef.current) return
      hintAnimatedRef.current = true
      await animate(x, 36, { duration: 0.22, ease: 'easeOut' })
      await animate(x, -24, { duration: 0.28, ease: 'easeInOut' })
      await animate(x, 0, SNAP_SPRING)
    }, 1400)
    return () => clearTimeout(t)
  }, [shouldReduceMotion, x])

  const swipeHandlers = useSwipeable({
    onSwipeStart: () => {
      if (shouldReduceMotion || isVoting) return
      isSwipingRef.current = true
      setIsDragging(true)
    },
    onSwiping: (eventData) => {
      if (shouldReduceMotion || isVoting) return
      // Mirror finger/mouse movement on the card.
      x.set(eventData.deltaX)
    },
    onSwiped: (eventData) => {
      if (shouldReduceMotion || isVoting) return
      isSwipingRef.current = false
      setIsDragging(false)
      if (eventData.deltaX > SWIPE_THRESHOLD) {
        onVote(true)
      } else if (eventData.deltaX < -SWIPE_THRESHOLD) {
        onVote(false)
      } else {
        animate(x, 0, SNAP_SPRING)
      }
    },
    onTouchEndOrOnMouseUp: () => {
      if (shouldReduceMotion || isVoting || !isSwipingRef.current) return
      isSwipingRef.current = false
      setIsDragging(false)
      animate(x, 0, SNAP_SPRING)
    },
    delta: 10,
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  return (
    <motion.div
      key="bluffOrTruth"
      className="absolute inset-0 flex flex-col bg-zinc-950"
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.36, ease: [0.32, 0.72, 0, 1] as const }
      }
    >
      <div className="absolute inset-0 flex flex-col">
        {/* Swipeable post only — image, author, caption move; labels + buttons stay fixed */}
        <div
          {...swipeHandlers}
          className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
          style={{ touchAction: 'pan-y' }}
        >
          <motion.div
            className={`flex min-h-0 max-h-full flex-col select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              x,
              rotate,
              transformOrigin: '50% 85%',
            }}
          >
            {/* Image card — fixed aspect so it always shows; min height so it never collapses */}
            <div className="flex min-h-[180px] flex-1 items-center justify-center px-4 pt-4 pb-3">
              <div className="relative aspect-[3/4] w-full max-w-[240px] shrink-0 overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={post.imageUrl}
                  alt=""
                  className="absolute inset-0 size-full object-cover pointer-events-none"
                  draggable={false}
                />
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    opacity: bgGreenOpacity,
                    background:
                      'linear-gradient(135deg, oklch(from var(--success) l c h / 0.55) 0%, transparent 60%)',
                  }}
                />
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    opacity: bgRedOpacity,
                    background:
                      'linear-gradient(225deg, oklch(from var(--destructive) l c h / 0.55) 0%, transparent 60%)',
                  }}
                />
                <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/75 via-black/25 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/92 via-black/55 to-transparent pointer-events-none" />
                <motion.div
                  className="absolute inset-0 flex items-center justify-start pl-4 pointer-events-none"
                  style={{ opacity: truthOpacity }}
                >
                  <div
                    className="rounded-xl px-3 py-1.5 border-[3px] border-success"
                    style={{
                      transform: 'rotate(-11deg)',
                      boxShadow: '0 0 20px oklch(from var(--success) l c h / 0.5)',
                    }}
                  >
                    <span className="text-lg font-black uppercase tracking-wider text-success">
                      {BLUFF_OR_TRUTH_STAGE.truthLabel}
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none"
                  style={{ opacity: bluffOpacity }}
                >
                  <div
                    className="rounded-xl px-3 py-1.5 border-[3px] border-destructive"
                    style={{
                      transform: 'rotate(11deg)',
                      boxShadow: '0 0 20px oklch(from var(--destructive) l c h / 0.5)',
                    }}
                  >
                    <span className="text-lg font-black uppercase tracking-wider text-destructive">
                      {BLUFF_OR_TRUTH_STAGE.bluffLabel}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Author + caption (part of post, swipes with image) */}
            <div className="relative z-10 flex min-h-0 shrink-0 flex-col space-y-2 px-4 pt-3 pb-2">
              <div className="flex items-center gap-2.5 shrink-0">
                <img
                  src={post.authorImgUrl}
                  alt=""
                  className="size-8 rounded-full shrink-0 object-cover ring-2 ring-white/20"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white leading-none truncate">
                    {post.authorName}
                  </p>
                  <p className="text-[10px] text-white/50 mt-0.5 leading-none truncate">
                    @{post.authorHandle} · {post.timeAgo}
                  </p>
                </div>
              </div>
              <p className="text-[13px] font-semibold text-white leading-snug">
                "{post.claim}"
              </p>
            </div>
          </motion.div>
        </div>

        {/* Fixed: swipe labels + buttons (do not move) */}
        <div className="shrink-0 space-y-3 p-4">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-destructive flex items-center gap-1">
              {BLUFF_OR_TRUTH_STAGE.swipeLeftLabel}
            </span>
            <span className="text-[9px] text-white/20 uppercase tracking-widest">
              {BLUFF_OR_TRUTH_STAGE.swipeHint}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-success flex items-center gap-1">
              {BLUFF_OR_TRUTH_STAGE.swipeRightLabel}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => !isVoting && onVote(false)}
              disabled={isVoting}
              className="flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-40 border border-destructive/40 bg-destructive/10 text-destructive"
            >
              {BLUFF_OR_TRUTH_STAGE.bluffButton}
            </button>
            <button
              type="button"
              onClick={() => !isVoting && onVote(true)}
              disabled={isVoting}
              className="flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-40 border border-success/40 bg-success/10 text-success"
            >
              {BLUFF_OR_TRUTH_STAGE.truthButton}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}