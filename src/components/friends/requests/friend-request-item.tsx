import { useMutation } from 'convex/react'
import { CheckIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { cn } from '@/lib/utils'

import type { RequestRow } from './types'

type FriendRequestItemProps = {
  request: RequestRow
}

export function FriendRequestItem({ request }: FriendRequestItemProps) {
  const accept = useMutation(api.friendships.accept)
  const reject = useMutation(api.friendships.reject)
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null)

  async function handleAccept() {
    setLoading('accept')
    try {
      await accept({ friendshipId: request._id })
      toast.success(`You and @${request.requester?.username} are now friends!`)
    } catch {
      toast.error('Failed to accept request.')
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    setLoading('reject')
    try {
      await reject({ friendshipId: request._id })
      toast.success('Request declined.')
    } catch {
      toast.error('Failed to decline request.')
    } finally {
      setLoading(null)
    }
  }

  const requester = request.requester
  if (!requester) return null

  const initials = requester.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <li className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted/40">
      <Avatar className="size-10 shrink-0">
        {requester.avatarUrl && (
          <AvatarImage src={requester.avatarUrl} alt={requester.displayName} />
        )}
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{requester.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">@{requester.username}</p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            'size-8 rounded-full text-muted-foreground hover:text-foreground',
            loading === 'reject' && 'opacity-50',
          )}
          onClick={handleReject}
          disabled={loading !== null}
          aria-label="Decline request"
        >
          <XIcon className="size-4" />
        </Button>
        <Button
          size="icon"
          className="size-8 rounded-full"
          onClick={handleAccept}
          disabled={loading !== null}
          aria-label="Accept request"
        >
          <CheckIcon className="size-4" />
        </Button>
      </div>
    </li>
  )
}
