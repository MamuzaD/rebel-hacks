import { api } from '@/convex/_generated/api'
import type { Doc, Id } from '@/convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import type { ReactNode } from 'react'
import { createContext, useMemo } from 'react'

type CurrentUser = Doc<'users'> | null
export type CurrentUserId = Id<'users'> | undefined

export type UserContextValue = {
  user: CurrentUser | undefined
  userId: CurrentUserId
  isLoading: boolean
  isAuthenticated: boolean
}

export const UserContext = createContext<UserContextValue | null>(null)
export function UserProvider({ children }: { children: ReactNode }) {
  const user = useQuery(api.users.getCurrent)
  const value = useMemo<UserContextValue>(
    () => ({
      user,
      userId: user?._id,
      isLoading: user === undefined,
      isAuthenticated: user != null,
    }),
    [user],
  )
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
