import { Skeleton } from '@/components/ui/skeleton'

function PostSkeleton() {
  return (
    <article className="w-full max-w-md overflow-hidden rounded-2xl bg-card ring-1 ring-border text-card-foreground">
      {/* Author row — matches Post */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <Skeleton className="size-9 shrink-0 rounded-full bg-muted" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3.5 w-24 bg-muted" />
          <Skeleton className="h-3 w-16 bg-muted" />
        </div>
      </div>

      {/* Image — matches Post (mx-3 aspect-square rounded-xl) */}
      <div className="mx-3 aspect-square overflow-hidden rounded-xl">
        <Skeleton className="size-full bg-muted" />
      </div>

      {/* Caption area — matches Post optional caption block */}
      <div className="space-y-1 px-4 pt-3">
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-4 w-3/4 bg-muted" />
      </div>

      {/* Voting buttons — matches Post (Bluff / Truth) */}
      <div className="flex gap-2 px-4 pt-3">
        <Skeleton className="h-9 flex-1 rounded-xl bg-muted" />
        <Skeleton className="h-9 flex-1 rounded-xl bg-muted" />
      </div>

      {/* Reactions + comment + vote count — matches Post bottom row */}
      <div className="flex items-center gap-2 px-4 pt-2.5 pb-4">
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-6 w-14 rounded-full bg-muted" />
          <Skeleton className="h-6 w-12 rounded-full bg-muted" />
          <Skeleton className="h-6 w-14 rounded-full bg-muted" />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Skeleton className="size-4 w-6 bg-muted" />
          <Skeleton className="h-3 w-12 bg-muted" />
        </div>
      </div>
    </article>
  )
}

export { PostSkeleton }
