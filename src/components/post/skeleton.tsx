import { Skeleton } from '@/components/ui/skeleton'

function PostSkeleton() {
  return (
    <article className="rounded-lg border bg-card p-4">
      {/* Author row */}
      <div className="mb-3 flex items-center gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Image (1 photo per post) */}
      <Skeleton className="aspect-4/5 w-full rounded-md" />

      {/* Claim */}
      <div className="mt-3 space-y-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Optional caption */}
      <Skeleton className="mt-2 h-3.5 w-1/2" />

      {/* Voting / interaction row */}
      <div className="mt-4 flex items-center gap-4">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-3.5 w-24" />
      </div>
    </article>
  )
}

export { PostSkeleton }
