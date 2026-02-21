import { animate, useMotionValue, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { useSwipeable } from 'react-swipeable'

const SWIPE_THRESHOLD = 72
const SWIPE_ANIMATION = { type: 'spring', stiffness: 420, damping: 34 } as const

type Guess = 'truth' | 'bluff'

type UseSwipeVoteParams = {
  enabled: boolean
  onGuessSelected: (guess: Guess) => void
}

export function useSwipeVote({ enabled, onGuessSelected }: UseSwipeVoteParams) {
  const swipeX = useMotionValue(0)
  const swipeRotate = useTransform(swipeX, [-220, 220], [-8, 8])
  const truthOpacity = useTransform(swipeX, [20, 90], [0, 1])
  const bluffOpacity = useTransform(swipeX, [-90, -20], [1, 0])
  const isSwipingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const resetSwipe = () => {
    animate(swipeX, 0, SWIPE_ANIMATION)
  }

  const handlers = useSwipeable({
    onSwipeStart: () => {
      if (!enabled) return
      isSwipingRef.current = true
      setIsDragging(true)
    },
    onSwiping: (eventData) => {
      if (!enabled) return
      swipeX.set(eventData.deltaX)
    },
    onSwiped: (eventData) => {
      if (!enabled) return
      isSwipingRef.current = false
      setIsDragging(false)

      if (eventData.deltaX > SWIPE_THRESHOLD) {
        onGuessSelected('truth')
        return
      }
      if (eventData.deltaX < -SWIPE_THRESHOLD) {
        onGuessSelected('bluff')
        return
      }
      resetSwipe()
    },
    onTouchEndOrOnMouseUp: () => {
      if (!enabled || !isSwipingRef.current) return
      isSwipingRef.current = false
      setIsDragging(false)
      resetSwipe()
    },
    delta: 10,
    trackMouse: true,
    preventScrollOnSwipe: true,
  })

  return {
    swipeX,
    swipeRotate,
    truthOpacity,
    bluffOpacity,
    isDragging,
    resetSwipe,
    handlers,
  }
}
