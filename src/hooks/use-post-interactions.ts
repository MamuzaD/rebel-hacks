import type { ReactionType } from '@/components/feed/post/reactions'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { formatChips, MIN_CHIP_AMOUNT } from '@/lib/betting'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'

export function usePostInteractions(): {
  handleVote: (postId: Id<'posts'>, guess: 'truth' | 'bluff', wager: number) => void
  handleReaction: (postId: Id<'posts'>, reactionType: ReactionType) => void
} {
  const vote = useMutation(api.votes.vote)
  const reactToPost = useMutation(api.reactions.add)

  const handleVote = (postId: Id<'posts'>, guess: 'truth' | 'bluff', wager: number) => {
    const label = guess === 'truth' ? 'Truth' : 'Bluff'
    vote({ postId, guess, wager })
      .then(() => toast.success(`Bet placed: ${formatChips(wager)} on ${label}`))
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error ?? '')
        if (/insufficient chips/i.test(message)) {
          toast.error('Not enough chips', {
            description: `Minimum bet is ${MIN_CHIP_AMOUNT} chips. Lower your bet or earn more chips first.`,
          })
          return
        }
        toast.error('Bet failed. Try again.')
      })
  }

  const handleReaction = (postId: Id<'posts'>, reactionType: ReactionType) => {
    reactToPost({ postId, reactionType }).catch(() => {})
  }

  return { handleVote, handleReaction }
}
