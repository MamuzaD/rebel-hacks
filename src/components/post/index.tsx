import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

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
    <Card className="w-md">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="size-10 shrink-0  rounded-full bg-muted">
          {post.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <div className="size-full bg-primary/30" />
          )}
        </div>
        <div className="">
          <p className="truncate font-medium">{post.authorName}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{post.authorHandle} · {post.timeAgo}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pt-0">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
          <img src={post.imageUrl} alt="" className="size-full object-cover" />
        </div>
        <div>
          <p className="font-medium leading-snug">{post.claim}</p>
          {post.caption && (
            <p className="mt-1 text-sm text-muted-foreground">{post.caption}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm">
            Truth
          </Button>
          <Button variant="outline" size="sm">
            Bluff
          </Button>
          <span className="text-xs text-muted-foreground">
            {post.voteCount} vote{post.voteCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TELLS.map((tell) => (
            <Badge key={tell} variant="secondary" className="text-xs">
              {tell}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}

export { Post }
