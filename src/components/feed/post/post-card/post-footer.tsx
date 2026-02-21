import type { ReactionType } from '@/components/feed/post/reactions'
import { Reactions } from '@/components/feed/post/reactions'
import { MessageCircle } from 'lucide-react'

type PostFooterProps = {
  reactionCounts?: Partial<Record<ReactionType, number>>
  myReaction?: ReactionType | null
  canReact: boolean
  postId?: string
  onReact?: (postId: string, reactionType: ReactionType) => void
  commentCount: number
  commentsOpen: boolean
  onToggleComments?: () => void
  voteCount: number
}

export function PostFooter({
  reactionCounts,
  myReaction,
  canReact,
  postId,
  onReact,
  commentCount,
  commentsOpen,
  onToggleComments,
  voteCount,
}: PostFooterProps) {
  return (
    <div className="flex items-center gap-2 px-4 pt-2.5 pb-4">
      <Reactions
        reactionCounts={reactionCounts}
        myReaction={myReaction}
        canReact={canReact}
        postId={postId}
        onReact={onReact}
      />
      <div className="ml-auto flex items-center gap-3">
        {onToggleComments && (
          <button
            type="button"
            onClick={onToggleComments}
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-label={commentsOpen ? 'Hide comments' : 'Show comments'}
          >
            <MessageCircle className="size-4" />
            {commentCount > 0 && <span className="tabular-nums">{commentCount}</span>}
          </button>
        )}
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground/80">
          {voteCount} vote{voteCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
