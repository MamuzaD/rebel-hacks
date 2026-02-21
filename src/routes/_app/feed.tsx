import { createFileRoute } from '@tanstack/react-router'

import { TodayPrompt } from '@/components/feed/today-prompt'
import { Post } from '@/components/post'
import { DEMO_POSTS } from '@/components/post/demo-posts'

export const Route = createFileRoute('/_app/feed')({
  loader: () => ({ posts: DEMO_POSTS }),
  component: FeedRouteComponent,
})

const TODAY_PROMPT =
  "What's your most overrated Vegas moment? (Or your best local secret.)"
function FeedRouteComponent() {
  const { posts } = Route.useLoaderData()

  return (
    <div className="space-y-6 p-4">
      <TodayPrompt prompt={TODAY_PROMPT} />

      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}
