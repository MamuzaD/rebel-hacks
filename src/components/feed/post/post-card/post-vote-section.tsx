import type { PostCardData } from '@/components/feed/post'
import { Button } from '@/components/ui/button'
import { NumberStepper } from '@/components/ui/number-stepper'
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CoinsIcon } from 'lucide-react'

type Guess = 'truth' | 'bluff'

type PostVoteSectionProps = {
  post: PostCardData
  canVote: boolean
  votePopoverOpen: boolean
  pendingGuess: Guess | null
  amount: number
  amountOptions: readonly number[]
  onAmountChange: (value: number) => void
  onOpenVotePopover: (guess: Guess) => void
  onCloseVotePopover: () => void
  onConfirmVote: () => void
}

export function PostVoteSection({
  post,
  canVote,
  votePopoverOpen,
  pendingGuess,
  amount,
  amountOptions,
  onAmountChange,
  onOpenVotePopover,
  onCloseVotePopover,
  onConfirmVote,
}: PostVoteSectionProps) {
  const isVotingOpen = post.isVotingOpen ?? true

  return (
    <div className="flex gap-2 px-4 pt-3">
      {post.isRevealed ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 py-2 text-sm font-semibold text-primary">
          It was {post.isTruth ? 'Truth' : 'Bluff'}
        </div>
      ) : !isVotingOpen ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-border/60 bg-muted/40 py-2 text-sm font-semibold text-muted-foreground">
          Voting closed
        </div>
      ) : post.isOwnPost ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-border/60 bg-muted/40 py-2 text-sm font-semibold text-muted-foreground">
          Your post
        </div>
      ) : post.hasVoted && post.myGuess ? (
        <div
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border py-2',
            post.myGuess === 'truth'
              ? 'border-success/30 bg-success/10'
              : 'border-destructive/30 bg-destructive/10',
          )}
        >
          <span
            className={cn(
              'text-sm font-bold',
              post.myGuess === 'truth' ? 'text-success' : 'text-destructive',
            )}
          >
            My Bet — {post.myGuess === 'truth' ? 'Truth' : 'Bluff'}
          </span>
          {post.myWager != null && (
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <CoinsIcon className="size-4" aria-hidden="true" />
              <span className="tabular-nums">{post.myWager}</span>
            </span>
          )}
        </div>
      ) : (
        <Popover open={votePopoverOpen} onOpenChange={(open) => !open && onCloseVotePopover()}>
          <PopoverTrigger
            nativeButton={false}
            className="flex flex-1 gap-2"
            render={(props) => (
              <div {...props} className="flex flex-1 gap-2">
                <span
                  className="flex-1"
                  title={post.isOwnPost ? "Silly you can't vote on your own post" : undefined}
                >
                  <button
                    type="button"
                    disabled={!canVote}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (canVote) onOpenVotePopover('bluff')
                    }}
                    className="w-full cursor-pointer rounded-xl border border-destructive/30 bg-destructive/10 py-2 text-sm font-bold text-destructive transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Bluff
                  </button>
                </span>
                <span
                  className="flex-1"
                  title={post.isOwnPost ? "Silly you can't vote on your own post" : undefined}
                >
                  <button
                    type="button"
                    disabled={!canVote}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (canVote) onOpenVotePopover('truth')
                    }}
                    className="w-full cursor-pointer rounded-xl border border-success/30 bg-success/10 py-2 text-sm font-bold text-success transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Truth
                  </button>
                </span>
              </div>
            )}
          />
          <PopoverContent side="top" sideOffset={8} className="w-56">
            <PopoverTitle>{pendingGuess === 'bluff' ? 'Bluff' : 'Truth'} — amount</PopoverTitle>
            <NumberStepper value={amount} options={amountOptions} onChange={onAmountChange}>
              <span className="tabular-nums font-medium">{amount} chips</span>
            </NumberStepper>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={onCloseVotePopover}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1" onClick={onConfirmVote}>
                Confirm
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
