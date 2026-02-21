import { useMutation } from 'convex/react'
import { UserMinusIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'

type ProfileFriendsListProps = {
  friends: Array<Doc<'users'>> | undefined
  isOwnProfile?: boolean
}

export function ProfileFriendsList({ friends, isOwnProfile = false }: ProfileFriendsListProps) {
  const unfriendMutation = useMutation(api.friendships.unfriend)
  const [removingId, setRemovingId] = useState<Id<'users'> | null>(null)
  if (friends === undefined) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((i) => (
          <div key={`friend-skeleton-${i}`} className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-full bg-muted/60" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 animate-pulse rounded bg-muted/60" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (friends.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No friends yet.</p>
  }

  async function handleRemove(friendId: Id<'users'>) {
    setRemovingId(friendId)
    try {
      await unfriendMutation({ otherUserId: friendId })
      toast.success('Removed from friends.')
    } catch {
      toast.error('Failed to remove friend.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto py-1">
      {friends.map((friend) => {
        const initials = friend.displayName
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
        const isRemoving = removingId === friend._id

        return (
          <li key={friend._id} className="flex items-center gap-3 rounded-xl p-2">
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={friend.avatarUrl} alt={friend.displayName} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{friend.displayName}</p>
              <p className="truncate text-xs text-muted-foreground">@{friend.username}</p>
            </div>
            {isOwnProfile && (
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(friend._id)}
                disabled={isRemoving}
                aria-label={`Remove ${friend.displayName} from friends`}
              >
                <UserMinusIcon className="size-4" aria-hidden />
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
