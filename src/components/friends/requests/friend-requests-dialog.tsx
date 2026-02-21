import { useQuery } from 'convex/react'
import { UserPlusIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api } from '@/convex/_generated/api'

import { IncomingRequestsList } from './incoming-requests-list'
import { SentRequestsList } from './sent-requests-list'

type FriendRequestsDialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function FriendRequestsDialog({ open, onOpenChange }: FriendRequestsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [tab, setTab] = useState<'incoming' | 'sent'>('incoming')
  const incomingRequests = useQuery(api.friendships.listPendingReceived)
  const sentRequests = useQuery(api.friendships.listPendingSent)

  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : internalOpen

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlusIcon className="size-4" />
            Friend Requests
          </DialogTitle>
          <DialogDescription>People who want to connect with you.</DialogDescription>
        </DialogHeader>
        <div className="mb-1 grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant={tab === 'incoming' ? 'default' : 'ghost'}
            onClick={() => setTab('incoming')}
          >
            Incoming
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === 'sent' ? 'default' : 'ghost'}
            onClick={() => setTab('sent')}
          >
            Sent
          </Button>
        </div>
        {tab === 'incoming' ? (
          <IncomingRequestsList requests={incomingRequests} />
        ) : (
          <SentRequestsList requests={sentRequests} />
        )}
      </DialogContent>
    </Dialog>
  )
}
