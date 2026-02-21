import { FriendRequestItem } from './friend-request-item'
import type { RequestRow } from './types'

type IncomingRequestsListProps = {
  requests: RequestRow[] | undefined
}

export function IncomingRequestsList({ requests }: IncomingRequestsListProps) {
  if (requests === undefined) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2].map((i) => (
          <div key={`incoming-skeleton-${i}`} className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-full bg-muted/60" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-28 animate-pulse rounded bg-muted/60" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">No pending friend requests.</p>
    )
  }

  return (
    <ul className="space-y-2 py-1">
      {requests.map((req) => (
        <FriendRequestItem key={req._id} request={req} />
      ))}
    </ul>
  )
}
