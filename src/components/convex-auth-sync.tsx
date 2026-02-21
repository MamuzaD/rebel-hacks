import { useAuth, useUser } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { useEffect, useRef } from 'react'
import { api } from '../../convex/_generated/api'

/**
 * Syncs the current Clerk user to Convex when Clerk profile fields change.
 * Mount once inside Convex + Clerk providers.
 * Username is required (Clerk is configured to require username after account creation).
 */
export function ConvexAuthSync() {
  const { isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const syncFromClerk = useMutation(api.users.syncFromClerk)
  const lastSyncedKey = useRef<string | null>(null)
  const syncingKey = useRef<string | null>(null)

  useEffect(() => {
    if (!isSignedIn) {
      lastSyncedKey.current = null
      syncingKey.current = null
      return
    }

    if (!clerkUser?.username) return

    const syncKey = `${clerkUser.username}|${clerkUser.fullName}|${clerkUser.imageUrl}`
    if (syncKey === lastSyncedKey.current || syncKey === syncingKey.current) return

    syncingKey.current = syncKey
    syncFromClerk({
      username: clerkUser.username,
      displayName: clerkUser.fullName || undefined,
      avatarUrl: clerkUser.imageUrl,
    })
      .then(() => {
        lastSyncedKey.current = syncKey
      })
      .catch(() => {
        // Allow retry on the next render cycle if sync fails.
      })
      .finally(() => {
        if (syncingKey.current === syncKey) syncingKey.current = null
      })
  }, [isSignedIn, clerkUser?.username, clerkUser?.fullName, clerkUser?.imageUrl, syncFromClerk])

  return null
}
