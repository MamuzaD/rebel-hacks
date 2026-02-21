import { Skeleton } from '@/components/ui/skeleton'

function PostSkeleton() {
  return (
    <article className="w-full max-w-md overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      {/* Author row */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <Skeleton className="size-9 shrink-0 rounded-full bg-muted" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-24 bg-muted" />
          <Skeleton className="h-3 w-16 bg-muted" />
        </div>
      </div>

      {/* Image */}
      <div className="mx-3">
        <Skeleton className="aspect-4/5 w-full rounded-xl bg-muted" />
      </div>

      {/* Claim */}
      <div className="space-y-1.5 px-4 pt-3">
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-4 w-3/4 bg-muted" />
      </div>

      {/* Voting buttons */}
      <div className="flex gap-2 px-4 pt-3">
        <Skeleton className="h-9 flex-1 rounded-xl bg-muted" />
        <Skeleton className="h-9 flex-1 rounded-xl bg-muted" />
      </div>

      {/* Tells row */}
      <div className="flex gap-1.5 px-4 pt-2.5 pb-4">
        <Skeleton className="h-5 w-16 rounded-full bg-muted" />
        <Skeleton className="h-5 w-18 rounded-full bg-muted" />
        <Skeleton className="h-5 w-20 rounded-full bg-muted" />
      </div>
    </article>
  )
}

export { PostSkeleton }
