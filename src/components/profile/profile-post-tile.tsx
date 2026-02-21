import { useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'
import type { PublicPost } from '@/lib/post'
import { cn } from '@/lib/utils'

type ProfilePostTileProps = {
  post: PublicPost
  isActive: boolean
  onClick: () => void
}

export function ProfilePostTile({ post, isActive, onClick }: ProfilePostTileProps) {
  const imageUrl = useQuery(api.files.getUrl, {
    storageId: post.imageStorageId,
  })

  if (imageUrl === undefined) {
    return <div className="aspect-square animate-pulse rounded-md bg-muted/40" />
  }

  return (
    <button
      type="button"
      className={cn(
        'group relative aspect-square overflow-hidden rounded-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive && 'ring-2 ring-ring ring-offset-1 ring-offset-background',
      )}
      onClick={onClick}
      aria-label="Open post preview"
    >
      <img
        src={imageUrl ?? ''}
        alt={post.caption ?? 'Post image'}
        className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/55 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      {post.caption && (
        <p className="pointer-events-none absolute inset-x-2 bottom-2 line-clamp-2 text-left text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {post.caption}
        </p>
      )}
    </button>
  )
}
