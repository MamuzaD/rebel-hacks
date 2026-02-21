import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { useEffect, useRef, useState } from 'react'

import { api } from '@/convex/_generated/api'
import { useInfiniteFeed } from '@/hooks/use-infinite-feed'
import { usePostInteractions } from '@/hooks/use-post-interactions'
import { useStatusLineFromPayload } from '@/hooks/use-status-line-from-payload'
import { useUser } from '@/hooks/use-user'

import { CreatePostModal } from '@/components/feed/post/create-post-modal'
import { FeedPostCard } from '@/components/feed/post/feed-post-card'
import { PostSkeleton } from '@/components/feed/post/skeleton'
import { FeedScopeTabs } from '@/components/feed/prompt/feed-scope-tabs'
import { TodayPrompt } from '@/components/feed/prompt/today-prompt'
import { ChallengeSeparator } from '@/components/feed/separator/challenge-separator'

export const Route = createFileRoute('/_app/feed')({
  component: FeedRouteComponent,
})

function FeedRouteComponent() {
  const [feedScope, setFeedScope] = useState<'global' | 'friends'>('global')
  const { user: currentUser } = useUser()
  const active = useQuery(api.prompts.getActive)
  const promptDoc = active?.prompt ?? null
  const myPostForPrompt = useQuery(
    api.posts.getMineForPrompt,
    currentUser != null && promptDoc != null ? { promptId: promptDoc._id } : 'skip',
  )
  const friendIds = useQuery(api.friendships.listFriendIds, currentUser != null ? {} : 'skip')

  const { sections, posts, isPostsLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteFeed(
      feedScope,
      friendIds ?? undefined,
      currentUser?._id,
      feedScope === 'global' || currentUser === null || friendIds !== undefined,
    )

  const { handleVote, handleReaction } = usePostInteractions()

  const sectionRefs = useRef<Map<number, HTMLElement>>(new Map())
  const promptRef = useRef<HTMLDivElement | null>(null)
  const intersectingIndicesRef = useRef<Set<number>>(new Set())
  const [intersectingIndices, setIntersectingIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    intersectingIndicesRef.current = new Set()
    setIntersectingIndices(new Set())

    const elements = Array.from(sectionRefs.current.entries())
      .sort(([a], [b]) => a - b)
      .map(([, el]) => el)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = parseInt(
            (entry.target as HTMLElement).getAttribute('data-section-index') ?? '',
            10,
          )
          if (Number.isNaN(idx)) return
          if (entry.isIntersecting) intersectingIndicesRef.current.add(idx)
          else intersectingIndicesRef.current.delete(idx)
        })
        setIntersectingIndices(new Set(intersectingIndicesRef.current))
      },
      { rootMargin: '-128px 0px 0px 0px', threshold: 0 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections.length])

  const currentHeaderSectionIndex =
    intersectingIndices.size > 0 ? Math.min(...intersectingIndices) : 0
  const hasCurrentHeaderSection = currentHeaderSectionIndex < sections.length
  const floatingHeaderOverride =
    hasCurrentHeaderSection && currentHeaderSectionIndex > 0
      ? {
          challengeLabel: 'Challenge' as const,
          prompt: sections[currentHeaderSectionIndex].promptText,
          statusLine: sections[currentHeaderSectionIndex].subtitle,
        }
      : null

  const statusLine = useStatusLineFromPayload(
    active
      ? {
          kind: active.statusKind,
          statusTimeMs: active.statusTimeMs,
          postingEndsAt: active.postingEndsAt,
        }
      : null,
  )

  const isLoading =
    active === undefined || (currentUser !== null && friendIds === undefined) || isPostsLoading

  return (
    <div className="space-y-4 p-4">
      <div ref={promptRef}>
        <TodayPrompt
          prompt={
            isLoading && promptDoc == null
              ? 'Loading…'
              : (promptDoc?.prompt ?? 'No active challenge right now.')
          }
          statusLine={active != null ? statusLine : undefined}
          challengeLabel={active?.challengeLabel}
          floatingHeaderOverride={floatingHeaderOverride}
          action={
            promptDoc != null && active?.statusKind === 'posting_begun' ? (
              <CreatePostModal
                prompt={promptDoc}
                isSignedIn={currentUser != null}
                hasPostedForPrompt={myPostForPrompt != null}
                compact
              />
            ) : undefined
          }
        />
      </div>
      <FeedScopeTabs scope={feedScope} onScopeChange={setFeedScope} stickyTargetRef={promptRef} />

      {isPostsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`feed-skeleton-${index + 1}`} className="flex w-full justify-center">
              <PostSkeleton />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {currentUser == null
              ? feedScope === 'friends'
                ? 'Sign in to see your friends feed.'
                : 'No posts yet. Check back soon.'
              : feedScope === 'friends'
                ? 'No friend posts yet. Add friends to fill this feed.'
                : 'No posts yet. Be the first to post when the challenge opens.'}
          </p>
        </div>
      ) : (
        <>
          {sections.map((section, index) => (
            <section
              key={section.promptId}
              ref={(el) => {
                if (el) sectionRefs.current.set(index, el)
                else sectionRefs.current.delete(index)
              }}
              data-section-index={index}
              className="space-y-4"
            >
              {!(promptDoc != null && section.promptId === promptDoc._id) && (
                <ChallengeSeparator promptText={section.promptText} subtitle={section.subtitle} />
              )}

              {section.posts.map((post) => (
                <FeedPostCard
                  key={post._id}
                  post={post}
                  isVotingOpen={section.isVotingOpen}
                  onVote={handleVote}
                  onReact={handleReaction}
                />
              ))}
            </section>
          ))}
          {hasNextPage ? (
            <div className="pt-2">
              <button
                type="button"
                className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
                onClick={fetchNextPage}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading more…' : 'Load more'}
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
