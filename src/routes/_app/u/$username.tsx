import { useClerk } from '@clerk/clerk-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { CoinsIcon, Grid3X3Icon, SettingsIcon, UsersIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { ProfileFriendAction } from '@/components/profile/profile-friend-action'
import { ProfileFriendsList } from '@/components/profile/profile-friends-list'
import { ProfilePostModalCard } from '@/components/profile/profile-post-modal-card'
import { ProfilePostTile } from '@/components/profile/profile-post-tile'
import { ProfileStat } from '@/components/profile/profile-stat'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { usePostInteractions } from '@/hooks/use-post-interactions'
import { useUser } from '@/hooks/use-user'

export const Route = createFileRoute('/_app/u/$username')({
  component: UserProfilePage,
})

function UserProfilePage() {
  const { username } = Route.useParams()
  const navigate = useNavigate()
  const { openUserProfile } = useClerk()
  const { userId: currentUserId } = useUser()
  const { handleVote, handleReaction } = usePostInteractions()
  const [activePostId, setActivePostId] = useState<Id<'posts'> | null>(null)
  const [friendsDialogOpen, setFriendsDialogOpen] = useState(false)
  const profileUser = useQuery(api.users.getByUsername, { username })
  const friendshipStatus = useQuery(
    api.friendships.getStatusWith,
    profileUser && currentUserId && profileUser._id !== currentUserId
      ? { otherUserId: profileUser._id }
      : 'skip',
  )
  const posts = useQuery(
    api.posts.listByAuthor,
    profileUser ? { authorId: profileUser._id } : 'skip',
  )
  const friends = useQuery(
    api.friendships.listForUser,
    profileUser ? { userId: profileUser._id } : 'skip',
  )
  const activePost = useMemo(
    () =>
      activePostId == null || posts == null
        ? null
        : (posts.find((post) => post._id === activePostId) ?? null),
    [activePostId, posts],
  )

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6">
      {profileUser === undefined ? (
        <div className="space-y-5">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted/60" />
          <div className="h-28 w-full animate-pulse rounded-2xl bg-muted/40" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`profile-loading-tile-${i + 1}`}
                className="aspect-square animate-pulse rounded-md bg-muted/40"
              />
            ))}
          </div>
        </div>
      ) : profileUser === null ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
          User not found.
        </div>
      ) : (
        <>
          <section className="space-y-5">
            <div className="flex flex-wrap items-center gap-5 sm:flex-nowrap sm:gap-8">
              <Avatar className="size-20 shrink-0 ring-2 ring-border sm:size-24">
                <AvatarImage
                  src={profileUser.avatarUrl}
                  alt={profileUser.displayName ?? profileUser.username}
                />
                <AvatarFallback className="bg-linear-to-br from-primary/70 via-primary/55 to-foreground/40">
                  {(profileUser.displayName ?? profileUser.username).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="truncate text-xl font-semibold text-foreground">
                      @{profileUser.username}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {profileUser.displayName}
                    </p>
                  </div>
                  {currentUserId != null &&
                    (profileUser._id === currentUserId ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openUserProfile()}
                        className="gap-1.5"
                      >
                        <SettingsIcon className="size-4" aria-hidden />
                        Settings
                      </Button>
                    ) : (
                      <ProfileFriendAction
                        profileUserId={profileUser._id}
                        friendshipStatus={friendshipStatus}
                      />
                    ))}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <ProfileStat label="posts" value={posts === undefined ? '—' : posts.length} />
                  <ProfileStat
                    label="chips"
                    value={profileUser.chipBalance.toLocaleString()}
                    icon={<CoinsIcon className="size-3.5" aria-hidden="true" />}
                    interactive
                    onClick={() => navigate({ to: '/history' })}
                  />
                  <ProfileStat
                    label="revealed"
                    value={
                      posts === undefined ? '—' : posts.filter((post) => post.isRevealed).length
                    }
                  />
                  <ProfileStat
                    label="friends"
                    value={friends === undefined ? '—' : friends.length}
                    icon={<UsersIcon className="size-3.5" aria-hidden="true" />}
                    interactive
                    onClick={() => setFriendsDialogOpen(true)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-medium text-foreground">{profileUser.displayName}</p>
            </div>
            <p className="text-sm text-muted-foreground">Playing bluff-or-truth in public.</p>
          </section>

          <section className="space-y-3 border-t border-border pt-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Grid3X3Icon className="size-3.5" aria-hidden="true" />
              Posts
            </div>
            {posts === undefined ? (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div
                    key={`profile-skeleton-${index + 1}`}
                    className="aspect-square animate-pulse rounded-md bg-muted/40"
                  />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
                No posts yet.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1 sm:gap-2">
                {posts.map((post) => (
                  <ProfilePostTile
                    key={post._id}
                    post={post}
                    isActive={activePostId === post._id}
                    onClick={() => setActivePostId(post._id)}
                  />
                ))}
              </div>
            )}
          </section>

          <Dialog
            open={activePost != null}
            onOpenChange={(open) => {
              if (!open) setActivePostId(null)
            }}
          >
            <DialogContent
              showCloseButton
              className="w-auto max-w-[min(96vw,72rem)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-[min(96vw,72rem)]"
            >
              <DialogHeader className="sr-only">
                <DialogTitle>Post preview</DialogTitle>
                <DialogDescription>View a profile post with comments.</DialogDescription>
              </DialogHeader>
              {activePost ? (
                <ProfilePostModalCard
                  post={activePost}
                  onVote={handleVote}
                  onReact={handleReaction}
                />
              ) : null}
            </DialogContent>
          </Dialog>

          <Dialog open={friendsDialogOpen} onOpenChange={setFriendsDialogOpen}>
            <DialogContent showCloseButton className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Friends</DialogTitle>
                <DialogDescription>
                  People connected with @{profileUser.username}.
                </DialogDescription>
              </DialogHeader>
              <ProfileFriendsList
                friends={friends}
                isOwnProfile={currentUserId != null && profileUser._id === currentUserId}
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
