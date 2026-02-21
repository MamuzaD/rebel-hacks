import { Link } from '@tanstack/react-router'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type PostAuthorRowProps = {
  authorHandle?: string
  authorAvatar?: string
  timeAgo: string
}

const FALLBACK_AVATAR_BG =
  'linear-gradient(135deg, color-mix(in oklch, var(--primary) 60%, var(--primary-foreground)) 0%, color-mix(in oklch, var(--primary) 40%, var(--foreground)) 100%)'

export function PostAuthorRow({ authorHandle, authorAvatar, timeAgo }: PostAuthorRowProps) {
  const hasAuthorHandle = Boolean(authorHandle)

  return (
    <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
      <Avatar className="size-9 shrink-0 ring-2 ring-border">
        <AvatarImage src={authorAvatar} alt="" />
        <AvatarFallback
          className="text-xs"
          style={{ background: authorAvatar ? undefined : FALLBACK_AVATAR_BG }}
        >
          {authorHandle?.slice(0, 2).toUpperCase() ?? '?'}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        {hasAuthorHandle ? (
          <Link
            to="/u/$username"
            params={{ username: authorHandle! }}
            className="truncate text-sm text-semibold text-foreground hover:underline"
          >
            @{authorHandle}
          </Link>
        ) : (
          <p className="truncate text-sm text-semibold text-foreground">@unknown</p>
        )}
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  )
}
