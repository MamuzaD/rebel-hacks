import { PostAuthorRow } from '@/components/feed/post/post-card/post-author-row'
import { PostFooter } from '@/components/feed/post/post-card/post-footer'
import { PostMedia } from '@/components/feed/post/post-card/post-media'
import { PostVoteSection } from '@/components/feed/post/post-card/post-vote-section'
import { useSwipeVote } from '@/components/feed/post/post-card/use-swipe-vote'
import type { ReactionType } from '@/components/feed/post/reactions'
import { useUser } from '@/hooks/use-user'
import {
  CHIP_OPTIONS,
  getChipOptionsForBalance,
  getClosestChipAmount,
  getDefaultAmount,
  MIN_CHIP_AMOUNT,
} from '@/lib/betting'
import { useEffect, useMemo, useState } from 'react'

/** Display data for one post card: post doc + author + image URL + votes/reactions, built in the feed. */
export type PostCardData = {
  id: string
  authorName: string
  authorHandle?: string
  authorAvatar?: string
  timeAgo: string
  imageUrl: string
  location?: string
  caption?: string
  voteCount: number
  hasVoted?: boolean
  myGuess?: 'truth' | 'bluff'
  myWager?: number
  reactionCounts?: Partial<Record<ReactionType, number>>
  myReaction?: ReactionType | null
  isRevealed?: boolean
  isTruth?: boolean
  isVotingOpen?: boolean
  isOwnPost?: boolean
}

type PostProps = {
  post: PostCardData
  postId?: string
  onVote?: (postId: string, guess: 'truth' | 'bluff', wager: number) => void
  onReact?: (postId: string, reactionType: ReactionType) => void
  commentCount?: number
  commentsOpen?: boolean
  onToggleComments?: () => void
}

function Post({
  post,
  postId,
  onVote,
  onReact,
  commentCount = 0,
  commentsOpen = false,
  onToggleComments,
}: PostProps) {
  const { user: currentUser } = useUser()
  const isVotingOpen = post.isVotingOpen ?? true
  const userChipBalance = currentUser?.chipBalance
  const canAffordMinBet = userChipBalance == null || userChipBalance >= MIN_CHIP_AMOUNT
  const availableChipOptions = useMemo(
    () => getChipOptionsForBalance(userChipBalance),
    [userChipBalance],
  )
  const canVote =
    postId &&
    onVote &&
    isVotingOpen &&
    !post.hasVoted &&
    !post.isRevealed &&
    !post.isOwnPost &&
    canAffordMinBet
  const canReact = postId && onReact
  const [votePopoverOpen, setVotePopoverOpen] = useState(false)
  const [pendingGuess, setPendingGuess] = useState<'truth' | 'bluff' | null>(null)
  const defaultSwipeChips = getDefaultAmount('swipe')
  const [amount, setAmount] = useState(defaultSwipeChips)
  const effectiveDefaultChips =
    availableChipOptions.length > 0
      ? Math.min(defaultSwipeChips, availableChipOptions[availableChipOptions.length - 1])
      : defaultSwipeChips

  useEffect(() => {
    if (availableChipOptions.length === 0) return
    if (availableChipOptions.includes(amount)) return
    const maxAvailable = availableChipOptions[availableChipOptions.length - 1]
    const nextAmount = Math.min(getClosestChipAmount(amount), maxAvailable)
    if (nextAmount !== amount) setAmount(nextAmount)
  }, [amount, availableChipOptions])
  const canSwipeVote = Boolean(canVote)

  const submitSwipeVote = (guess: 'truth' | 'bluff') => {
    if (postId && onVote) {
      onVote(postId, guess, effectiveDefaultChips)
    }
    resetSwipe()
  }

  const openVotePopover = (guess: 'truth' | 'bluff') => {
    resetSwipe()
    setPendingGuess(guess)
    setAmount(effectiveDefaultChips)
    setVotePopoverOpen(true)
  }
  const confirmVote = () => {
    if (postId && pendingGuess) {
      onVote?.(postId, pendingGuess, amount)
      setVotePopoverOpen(false)
      setPendingGuess(null)
    }
  }
  const closeVotePopover = () => {
    setVotePopoverOpen(false)
    setPendingGuess(null)
  }
  const swipeVote = useSwipeVote({
    enabled: canSwipeVote,
    onGuessSelected: submitSwipeVote,
  })
  const { resetSwipe } = swipeVote

  return (
    <article className="w-full max-w-md text-card-foreground">
      <PostAuthorRow
        authorHandle={post.authorHandle}
        authorAvatar={post.authorAvatar}
        timeAgo={post.timeAgo}
      />
      <PostMedia post={post} swipe={swipeVote} canSwipeVote={canSwipeVote} />
      {!post.isRevealed && canSwipeVote && (
        <div className="flex items-center justify-between px-4 pt-2 text-[10px] font-bold uppercase tracking-widest">
          <span className="text-destructive">Swipe left: Bluff</span>
          <span className="text-success">Swipe right: Truth</span>
        </div>
      )}

      <PostVoteSection
        post={post}
        canVote={Boolean(canVote)}
        votePopoverOpen={votePopoverOpen}
        pendingGuess={pendingGuess}
        amount={amount}
        amountOptions={availableChipOptions.length > 0 ? availableChipOptions : CHIP_OPTIONS}
        onAmountChange={setAmount}
        onOpenVotePopover={openVotePopover}
        onCloseVotePopover={closeVotePopover}
        onConfirmVote={confirmVote}
      />
      <PostFooter
        reactionCounts={post.reactionCounts}
        myReaction={post.myReaction}
        canReact={Boolean(canReact)}
        postId={postId}
        onReact={onReact}
        commentCount={commentCount}
        commentsOpen={commentsOpen}
        onToggleComments={onToggleComments}
        voteCount={post.voteCount}
      />
    </article>
  )
}

export { Post }
