import { SentRequestItem } from './sent-request-item'
import type { SentRequestRow } from './types'

type SentRequestsListProps = {
  requests: SentRequestRow[] | undefined
}

export function SentRequestsList({ requests }: SentRequestsListProps) {
  if (requests === undefined) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2].map((i) => (
          <div key={`sent-skeleton-${i}`} className="flex items-center gap-3">
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
      <p className="py-6 text-center text-sm text-muted-foreground">No sent friend requests.</p>
    )
  }

  return (
    <ul className="space-y-2 py-1">
      {requests.map((req) => (
        <SentRequestItem key={req._id} request={req} />
      ))}
    </ul>
  )
}
