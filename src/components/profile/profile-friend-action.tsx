import { useMutation } from 'convex/react'
import { CheckIcon, UserMinusIcon, UserPlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import type { FriendshipStatus } from '@/components/profile/types'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

type ProfileFriendActionProps = {
  profileUserId: Id<'users'>
  friendshipStatus: FriendshipStatus | undefined
}

export function ProfileFriendAction({ profileUserId, friendshipStatus }: ProfileFriendActionProps) {
  const requestMutation = useMutation(api.friendships.request)
  const acceptMutation = useMutation(api.friendships.accept)
  const rejectMutation = useMutation(api.friendships.reject)
  const unfriendMutation = useMutation(api.friendships.unfriend)
  const [loading, setLoading] = useState<'request' | 'accept' | 'reject' | 'unfriend' | null>(null)

  async function handleRequest() {
    setLoading('request')
    try {
      await requestMutation({ addresseeId: profileUserId })
      toast.success('Friend request sent.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send request.')
    } finally {
      setLoading(null)
    }
  }

  async function handleAccept() {
    if (friendshipStatus?.status !== 'pending' || friendshipStatus.isSender) return
    setLoading('accept')
    try {
      await acceptMutation({ friendshipId: friendshipStatus.friendshipId })
      toast.success('You are now friends!')
    } catch {
      toast.error('Failed to accept request.')
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!friendshipStatus) return
    setLoading('reject')
    try {
      await rejectMutation({ friendshipId: friendshipStatus.friendshipId })
      toast.success('Request declined.')
    } catch {
      toast.error('Failed to decline request.')
    } finally {
      setLoading(null)
    }
  }

  async function handleUnfriend() {
    setLoading('unfriend')
    try {
      await unfriendMutation({ otherUserId: profileUserId })
      toast.success('Removed from friends.')
    } catch {
      toast.error('Failed to remove friend.')
    } finally {
      setLoading(null)
    }
  }

  const busy = loading !== null

  if (friendshipStatus === undefined) {
    return <div className="h-9 w-24 animate-pulse rounded-4xl bg-muted/60" aria-hidden />
  }

  if (friendshipStatus === null) {
    return (
      <Button
        size="sm"
        variant="default"
        onClick={handleRequest}
        disabled={busy}
        className="gap-1.5"
      >
        <UserPlusIcon className="size-4" aria-hidden />
        Add Friend
      </Button>
    )
  }

  if (friendshipStatus.status === 'pending') {
    if (friendshipStatus.isSender) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Request sent</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReject}
            disabled={busy}
            className="gap-1.5 text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleReject}
          disabled={busy}
          className="size-9 rounded-full p-0"
          aria-label="Decline request"
        >
          <XIcon className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="default"
          onClick={handleAccept}
          disabled={busy}
          className="gap-1.5"
        >
          <CheckIcon className="size-4" aria-hidden />
          Accept
        </Button>
      </div>
    )
  }

  if (friendshipStatus.status === 'accepted') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Friends</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleUnfriend}
          disabled={busy}
          className="gap-1.5 text-muted-foreground"
          aria-label="Remove friend"
        >
          <UserMinusIcon className="size-4" aria-hidden />
          Unfriend
        </Button>
      </div>
    )
  }

  return null
}
