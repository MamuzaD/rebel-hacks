import type { PostCardData } from '@/components/feed/post'
import { Post } from '@/components/feed/post'
import { CommentsPanel } from '@/components/feed/post/comment/comments-panel'
import type { ReactionType } from '@/components/feed/post/reactions'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@/hooks/use-user'
import type { PublicPost } from '@/lib/post'
import { timeAgo } from '@/lib/time'
import { cn } from '@/lib/utils'
import { useQuery } from 'convex/react'
import { useState } from 'react'

type FeedPostCardProps = {
  post: PublicPost
  isVotingOpen?: boolean
  onVote: (postId: Id<'posts'>, guess: 'truth' | 'bluff', wager: number) => void
  onReact: (postId: Id<'posts'>, reactionType: ReactionType) => void
}

export function FeedPostCard({ post, isVotingOpen, onVote, onReact }: FeedPostCardProps) {
  const { userId: currentUserId } = useUser()
  const [commentsOpen, setCommentsOpen] = useState(false)
  const author = useQuery(api.users.getById, { userId: post.authorId })
  const imageUrl = useQuery(api.files.getUrl, {
    storageId: post.imageStorageId,
  })
  const voteCount = useQuery(api.votes.countForPost, { postId: post._id }) ?? 0
  const myVote = useQuery(api.votes.getMyVote, { postId: post._id })
  const reactionCounts = useQuery(api.reactions.getCountsByPost, {
    postId: post._id,
  })
  const myReaction = useQuery(api.reactions.getMyReaction, {
    postId: post._id,
  })
  const commentCount = useQuery(api.comments.countByPost, { postId: post._id }) ?? 0

  if (author === undefined || imageUrl === undefined) {
    return (
      <div className="flex w-full justify-center">
        <article className="h-96 w-md shrink-0 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    )
  }

  const cardData: PostCardData = {
    id: post._id,
    authorName: author?.displayName ?? 'Unknown',
    authorHandle: author?.username,
    authorAvatar: author?.avatarUrl,
    timeAgo: timeAgo(post._creationTime),
    imageUrl: imageUrl ?? '',
    caption: post.caption,
    voteCount,
    hasVoted: myVote != null,
    myGuess: myVote?.guess,
    myWager: myVote?.wager,
    reactionCounts: reactionCounts ?? undefined,
    myReaction: myReaction?.reactionType ?? null,
    isRevealed: post.isRevealed,
    isTruth: post.isRevealed ? post.actual === 'truth' : undefined,
    isVotingOpen: isVotingOpen ?? true,
    isOwnPost: currentUserId != null && post.authorId === currentUserId,
  }

  return (
    <div className="flex w-full justify-center">
      {/* relative so the comments panel can be inset-y-0 against the card */}
      <div className="relative flex overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-all duration-300">
        {/* Post — sole driver of the card's height */}
        <div className="w-md shrink-0">
          <Post
            post={cardData}
            postId={post._id}
            onVote={(id, guess, wager) => onVote(id as Id<'posts'>, guess, wager)}
            onReact={(id, reactionType) => onReact(id as Id<'posts'>, reactionType)}
            commentCount={commentCount}
            commentsOpen={commentsOpen}
            onToggleComments={() => setCommentsOpen((prev) => !prev)}
          />
        </div>

        {/* Width-only placeholder: expands the card horizontally without affecting height */}
        <div
          className={cn('shrink-0 transition-all duration-300', commentsOpen ? 'w-72' : 'w-0')}
        />

        {/* Comments panel: absolutely constrained to the card's natural (post-driven) height */}
        <div
          className={cn(
            'absolute inset-y-0 right-0 overflow-hidden transition-all duration-300',
            commentsOpen ? 'w-72' : 'w-0',
          )}
        >
          <CommentsPanel
            postId={post._id}
            open={commentsOpen}
            onClose={() => setCommentsOpen(false)}
          />
        </div>
      </div>
    </div>
  )
}
