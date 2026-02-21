import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type { PublicPost } from '@/lib/post'
import { isVotingWindowOpen } from '@/lib/round-status'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useConvex, useQuery } from 'convex/react'

export type FeedSection = {
  promptId: Id<'prompts'>
  promptText: string
  subtitle: string
  isVotingOpen: boolean
  posts: PublicPost[]
}

type Cursor = string | null
type FeedScope = 'global' | 'friends'

export function useInfiniteFeed(
  scope: FeedScope,
  friendIds: Id<'users'>[] | undefined,
  currentUserId: Id<'users'> | undefined,
  enabled: boolean,
): {
  sections: FeedSection[]
  posts: PublicPost[]
  isPostsLoading: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
} {
  const convex = useConvex()
  const recentPrompts = useQuery(api.prompts.list, { limit: 30 })

  const feedPosts = useInfiniteQuery({
    queryKey: ['feedPosts', scope, friendIds ?? [], currentUserId],
    enabled,
    initialPageParam: null as Cursor,
    queryFn: async ({ pageParam }) => {
      if (scope === 'global') {
        return convex.query(api.posts.listGlobalFeedPaginated, {
          limit: 20,
          cursor: pageParam ?? undefined,
        })
      }

      return convex.query(api.posts.listFriendsFeedPaginated, {
        friendIds: friendIds ?? [],
        currentUserId,
        limit: 20,
        cursor: pageParam ?? undefined,
      })
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const posts =
    feedPosts.data?.pages.flatMap((page) => page.posts).filter((p): p is PublicPost => p != null) ??
    []

  const promptById = new Map((recentPrompts ?? []).map((p) => [p._id, p]))
  const now = Date.now()
  const sections = posts.reduce<FeedSection[]>((acc, post) => {
    const existing = acc.find((section) => section.promptId === post.promptId)
    if (existing) {
      existing.posts.push(post)
      return acc
    }
    const promptForPost = promptById.get(post.promptId)
    const subtitle = promptForPost
      ? new Date(promptForPost.postWindowStart).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : post.postDate
    const isVotingOpen =
      promptForPost != null
        ? isVotingWindowOpen(
            now,
            promptForPost.postWindowStart,
            promptForPost.postWindowEnd,
            promptForPost.revealTime,
          )
        : false
    acc.push({
      promptId: post.promptId,
      promptText: promptForPost?.prompt ?? 'Daily challenge',
      subtitle,
      isVotingOpen,
      posts: [post],
    })
    return acc
  }, [])

  const fetchNextPage = () => {
    feedPosts.fetchNextPage().catch(() => {})
  }

  return {
    sections,
    posts,
    isPostsLoading: feedPosts.isPending,
    hasNextPage: feedPosts.hasNextPage,
    isFetchingNextPage: feedPosts.isFetchingNextPage,
    fetchNextPage,
  }
}
