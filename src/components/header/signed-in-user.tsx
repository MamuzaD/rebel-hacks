import { UserAvatar, useUser as useClerkUser } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { CoinsIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { UserMenu } from '@/components/header/menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { useUser } from '@/hooks/use-user'

const userAvatarAppearance = {
  elements: {
    avatarBox: '!h-10 !w-10',
  },
}

export function SignedInUser() {
  const { user: clerkUser } = useClerkUser()
  const { user } = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pendingRequests = useQuery(api.friendships.listPendingReceived, user ? undefined : 'skip')
  const pendingCount = pendingRequests?.length ?? 0

  // Username is required in Clerk after account creation, so it's always set when signed in.
  const handle = clerkUser?.username ?? clerkUser?.firstName ?? undefined
  const displayHandle = handle ? `@${handle}` : null

  const closeDropdown = () => setDropdownOpen(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown()
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        className="relative px-3 py-7"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {pendingCount > 0 && (
          <Badge
            variant="default"
            className="absolute -top-0.5 -right-0.5 size-5 min-w-5 p-0 justify-center text-[10px] font-semibold"
            aria-label={`${pendingCount} friend request${pendingCount === 1 ? '' : 's'} pending`}
          >
            {pendingCount > 9 ? '9+' : pendingCount}
          </Badge>
        )}
        <UserAvatar appearance={userAvatarAppearance} />
        {displayHandle && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="min-w-0 max-w-20 truncate text-sm font-medium text-primary/70">
              {displayHandle}
            </span>
            {user && (
              <span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums text-foreground">
                <CoinsIcon className="size-4" aria-hidden="true" />
                {user.chipBalance}
              </span>
            )}
          </div>
        )}
      </Button>

      <UserMenu open={dropdownOpen} onClose={closeDropdown} />
    </div>
  )
}
