import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import type { Ref } from 'react'

type CommentWithUser = Doc<'comments'> & {
  user: Doc<'users'> | null
}

type CommentInputProps = {
  replyTarget: CommentWithUser | undefined
  setReplyToId: (id: Id<'comments'> | null) => void
  text: string
  setText: (value: string) => void
  handleSubmit: () => void
  currentUser: Doc<'users'> | null
  inputRef?: Ref<HTMLInputElement>
}

export function CommentInput({
  replyTarget,
  setReplyToId,
  text,
  setText,
  handleSubmit,
  currentUser,
  inputRef,
}: CommentInputProps) {
  return (
    <div className="shrink-0 border-t border-border p-3">
      {currentUser == null ? (
        <p className="text-center text-xs text-muted-foreground">Sign in to comment</p>
      ) : (
        <div className="space-y-2">
          {replyTarget ? (
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <p className="truncate">Replying to @{replyTarget.user?.username ?? 'unknown'}</p>
              <button
                type="button"
                className="shrink-0 font-medium hover:text-foreground mr-2"
                onClick={() => setReplyToId(null)}
              >
                Cancel
              </button>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder={replyTarget ? 'Write a reply' : 'Add a comment'}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              className="min-w-0 flex-1 text-sm"
              maxLength={500}
            />
            <Button type="button" size="sm" disabled={!text.trim()} onClick={handleSubmit}>
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
