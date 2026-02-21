import { useQuery } from 'convex/react'

import type { PostCardData } from '@/components/feed/post'
import { Post } from '@/components/feed/post'
import { CommentsPanel } from '@/components/feed/post/comment/comments-panel'
import type { ReactionType } from '@/components/feed/post/reactions'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { useUser } from '@/hooks/use-user'
import type { PublicPost } from '@/lib/post'
import { timeAgo } from '@/lib/time'

type ProfilePostModalCardProps = {
  post: PublicPost
  onVote: (postId: Id<'posts'>, guess: 'truth' | 'bluff', wager: number) => void
  onReact: (postId: Id<'posts'>, reactionType: ReactionType) => void
}

export function ProfilePostModalCard({ post, onVote, onReact }: ProfilePostModalCardProps) {
  const { userId: currentUserId } = useUser()
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
      <div className="flex min-h-128 w-[min(92vw,66rem)] items-center justify-center">
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
    reactionCounts: reactionCounts ?? undefined,
    myReaction: myReaction?.reactionType ?? null,
    isRevealed: post.isRevealed,
    isTruth: post.isRevealed ? post.actual === 'truth' : undefined,
    isVotingOpen: true,
    isOwnPost: currentUserId != null && post.authorId === currentUserId,
  }

  return (
    <div className="flex min-h-128 w-[min(92vw,66rem)] items-center justify-center p-3 sm:p-4">
      <div className="relative flex overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-all duration-300">
        <div className="w-md shrink-0">
          <Post
            post={cardData}
            postId={post._id}
            onVote={(id, guess, wager) => onVote(id as Id<'posts'>, guess, wager)}
            onReact={(id, reactionType) => onReact(id as Id<'posts'>, reactionType)}
            commentCount={commentCount}
            commentsOpen
          />
        </div>

        <div className="w-72 shrink-0" />

        <div className="absolute inset-y-0 right-0 w-72 overflow-hidden">
          <CommentsPanel postId={post._id} open />
        </div>
      </div>
    </div>
  )
}
