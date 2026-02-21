import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { useUser } from '@/hooks/use-user'
import { useMutation, useQuery } from 'convex/react'
import { useMemo, useRef, useState } from 'react'

type CommentWithUser = Doc<'comments'> & {
  user: Doc<'users'> | null
}

export type ThreadedComment = CommentWithUser & {
  replies: ThreadedComment[]
}

function buildCommentTree(comments: CommentWithUser[]): ThreadedComment[] {
  const byId = new Map<Id<'comments'>, ThreadedComment>()
  const roots: ThreadedComment[] = []

  for (const comment of comments) {
    byId.set(comment._id, { ...comment, replies: [] })
  }

  for (const comment of comments) {
    const node = byId.get(comment._id)
    if (node == null) continue
    if (comment.parentId == null) {
      roots.push(node)
      continue
    }
    const parent = byId.get(comment.parentId)
    if (parent == null) {
      roots.push(node)
      continue
    }
    parent.replies.push(node)
  }

  return roots
}

export function useComments(postId: Id<'posts'>, enabled: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')
  const [replyToId, setReplyToId] = useState<Id<'comments'> | null>(null)
  const { user: currentUser } = useUser()
  const comments = useQuery(api.comments.listByPost, enabled ? { postId } : 'skip')
  const threadedComments = useMemo(
    () => (comments == null ? undefined : buildCommentTree(comments)),
    [comments],
  )
  const addComment = useMutation(api.comments.add)

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || currentUser == null) return
    addComment({ postId, text: trimmed, parentId: replyToId ?? undefined })
      .then(() => {
        setText('')
        setReplyToId(null)
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        })
      })
      .catch(() => {})
  }

  return {
    comments,
    threadedComments,
    isLoading: comments === undefined,
    currentUser,
    scrollRef,
    text,
    setText,
    replyToId,
    setReplyToId,
    handleSubmit,
  }
}
