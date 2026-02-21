import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from '@tanstack/react-router'

import type { Id } from '@/convex/_generated/dataModel'
import type { ThreadedComment } from '@/hooks/use-comments'
import { timeAgo } from '@/lib/time'

type CommentItemProps = {
  comment: ThreadedComment
  depth: number
  onReply: (commentId: Id<'comments'>) => void
}

export function Comment({ comment, depth, onReply }: CommentItemProps) {
  const username = comment.user?.username
  const initials = username?.slice(0, 2).toUpperCase() ?? '?'

  return (
    <li>
      <div className="flex gap-3">
        <Avatar className="size-7 shrink-0 ring-2 ring-border">
          <AvatarImage src={comment.user?.avatarUrl} alt="" />
          <AvatarFallback
            className="text-[10px]"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 40%, var(--muted) 100%)',
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          {username ? (
            <Link
              to="/u/$username"
              params={{ username }}
              className="text-xs font-medium text-foreground hover:underline"
            >
              @{username}
            </Link>
          ) : (
            <p className="text-xs font-medium text-foreground">Unknown user</p>
          )}
          <p className="text-sm text-muted-foreground">{comment.text}</p>
          <div className="mt-0.5 flex items-center gap-2">
            <p className="text-[11px] text-muted-foreground/80">{timeAgo(comment.createdAt)}</p>
            <button
              type="button"
              className="text-[11px] font-medium text-muted-foreground/80 hover:text-foreground"
              onClick={() => onReply(comment._id)}
            >
              Reply
            </button>
          </div>
        </div>
      </div>
      {comment.replies.length > 0 ? (
        <ul
          className={
            depth > 2
              ? 'mt-3 space-y-3 border-l border-border/60 pl-2'
              : 'mt-3 space-y-3 border-l border-border/60 pl-4'
          }
        >
          {comment.replies.map((reply) => (
            <Comment key={reply._id} comment={reply} depth={depth + 1} onReply={onReply} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
