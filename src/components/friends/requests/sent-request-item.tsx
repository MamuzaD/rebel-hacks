import { useMutation, useQuery } from 'convex/react'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'

import type { SentRequestRow } from './types'

type SentRequestItemProps = {
  request: SentRequestRow
}

export function SentRequestItem({ request }: SentRequestItemProps) {
  const reject = useMutation(api.friendships.reject)
  const addressee = useQuery(api.users.getById, { userId: request.addresseeId })
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)
    try {
      await reject({ friendshipId: request._id })
      toast.success('Friend request canceled.')
    } catch {
      toast.error('Failed to cancel request.')
    } finally {
      setLoading(false)
    }
  }

  if (addressee === undefined) {
    return (
      <li className="flex items-center gap-3 rounded-xl p-2">
        <div className="size-10 animate-pulse rounded-full bg-muted/60" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-28 animate-pulse rounded bg-muted/60" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
        </div>
      </li>
    )
  }

  if (addressee === null) return null

  const initials = addressee.displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <li className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted/40">
      <Avatar className="size-10 shrink-0">
        {addressee.avatarUrl && (
          <AvatarImage src={addressee.avatarUrl} alt={addressee.displayName} />
        )}
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{addressee.displayName}</p>
        <p className="truncate text-xs text-muted-foreground">@{addressee.username}</p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCancel}
        disabled={loading}
        className="gap-1.5 text-muted-foreground"
      >
        <XIcon className="size-4" />
        Cancel
      </Button>
    </li>
  )
}
