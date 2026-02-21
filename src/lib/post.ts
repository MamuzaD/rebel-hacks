import type { Doc } from '@/convex/_generated/dataModel'

export type PublicPost = Omit<Doc<'posts'>, 'actual'> & {
  actual?: Doc<'posts'>['actual']
}
