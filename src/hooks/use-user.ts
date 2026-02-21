import type { UserContextValue } from '@/contexts/user-context'
import { UserContext } from '@/contexts/user-context'
import { useContext } from 'react'

/**
 * Current user from app-level UserContext. Same API as useUser() from context.
 */
export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (ctx == null) {
    throw new Error('useUser must be used within UserProvider')
  }
  return ctx
}
