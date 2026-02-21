const TELLS = ['Too perfect', 'No receipts', 'Tourist energy'] as const

export type DemoPost = {
  id: string
  authorName: string
  authorHandle: string
  authorAvatar?: string
  timeAgo: string
  imageUrl: string
  claim: string
  caption?: string
  voteCount: number
  hasVoted?: boolean
  tellCounts?: Record<string, number>
}

type PostProps = {
  post: DemoPost
}

function Post({ post }: PostProps) {
  return (
    <article className="w-full max-w-md overflow-hidden rounded-2xl bg-card text-card-foreground ring-1 ring-border">
      {/* Author row */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div
          className="size-9 shrink-0 rounded-full ring-2 ring-border"
          style={{
            background: post.authorAvatar
              ? undefined
              : 'linear-gradient(135deg, color-mix(in oklch, var(--primary) 60%, var(--primary-foreground)) 0%, color-mix(in oklch, var(--primary) 40%, var(--foreground)) 100%)',
          }}
        >
          {post.authorAvatar && (
            <img
              src={post.authorAvatar}
              alt=""
              className="size-full rounded-full object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {post.authorName}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{post.authorHandle} · {post.timeAgo}
          </p>
        </div>
      </div>

      {/* Image */}
      <div className="relative mx-3 aspect-4/5 overflow-hidden rounded-xl">
        <img
          src={post.imageUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-card/90 via-card/40 to-transparent" />
      </div>

      {/* Claim + caption */}
      <div className="space-y-1 px-4 pt-3">
        <p className="text-[15px] font-semibold leading-snug text-foreground">
          &ldquo;{post.claim}&rdquo;
        </p>
        {post.caption && (
          <p className="text-sm text-muted-foreground">{post.caption}</p>
        )}
      </div>

      {/* Voting */}
      <div className="flex gap-2 px-4 pt-3">
        <button
          type="button"
          className="flex-1 cursor-pointer rounded-xl border border-destructive/30 bg-destructive/10 py-2 text-sm font-bold text-destructive transition-all active:scale-[0.97]"
        >
          Bluff
        </button>
        <button
          type="button"
          className="flex-1 cursor-pointer rounded-xl border border-success/30 bg-success/10 py-2 text-sm font-bold text-success transition-all active:scale-[0.97]"
        >
          Truth
        </button>
      </div>

      {/* Tells + vote count */}
      <div className="flex items-center gap-2 px-4 pt-2.5 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {TELLS.map((tell) => (
            <span
              key={tell}
              className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {tell}
            </span>
          ))}
        </div>
        <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground/80">
          {post.voteCount} vote{post.voteCount !== 1 ? 's' : ''}
        </span>
      </div>
    </article>
  )
}

export { Post }
