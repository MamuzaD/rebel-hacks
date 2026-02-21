import { useClerk } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { HistoryIcon, LayoutListIcon, LogOutIcon, UserIcon, UserPlusIcon } from 'lucide-react'
import { useState } from 'react'

import { FriendRequestsDialog } from '@/components/friends/requests'
import { ThemeToggle } from '@/components/theme/toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { api } from '@/convex/_generated/api'
import { useUser } from '@/hooks/use-user'

const linkItemClass =
  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-muted hover:text-foreground focus-visible:bg-muted [&_svg]:size-4'

type UserMenuProps = {
  open: boolean
  onClose: () => void
}

export function UserMenu({ open, onClose }: UserMenuProps) {
  const { openUserProfile, signOut } = useClerk()
  const { user } = useUser()
  const [friendRequestsOpen, setFriendRequestsOpen] = useState(false)
  const pendingRequests = useQuery(api.friendships.listPendingReceived, user ? undefined : 'skip')
  const pendingCount = pendingRequests?.length ?? 0

  const menu = open ? (
    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-popover p-4 shadow-lg border border-border z-50">
      {/* Profile link */}
      <Link to="/feed" className={linkItemClass} onClick={onClose}>
        <LayoutListIcon />
        Feed
      </Link>

      {user && (
        <Link
          to="/u/$username"
          params={{ username: user.username }}
          className={linkItemClass}
          onClick={onClose}
        >
          <UserIcon />
          Profile
        </Link>
      )}

      <Link to="/history" className={linkItemClass} onClick={onClose}>
        <HistoryIcon />
        History
      </Link>

      {user && (
        <button
          type="button"
          className={`${linkItemClass} w-full justify-between`}
          onClick={() => {
            setFriendRequestsOpen(true)
            onClose()
          }}
        >
          <span className="flex items-center gap-2.5">
            <UserPlusIcon />
            Friend Requests
          </span>
          {pendingCount > 0 && (
            <Badge variant="default" className="ml-auto shrink-0">
              {pendingCount}
            </Badge>
          )}
        </button>
      )}

      {/* Manage account — Clerk's built-in profile modal */}
      <Button
        variant="ghost"
        className="w-full justify-start rounded-xl gap-2.5"
        onClick={() => {
          openUserProfile()
          onClose()
        }}
      >
        <UserIcon />
        Manage account
      </Button>

      {/* Theme: Light, Dark, System */}
      <div className="px-3 py-2">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Theme</p>
        <ThemeToggle />
      </div>

      {/* Sign out */}
      <div className="mt-1 border-t border-border/50 pt-2">
        <Button
          variant="destructive"
          className="bg-transparent w-full justify-start rounded-xl gap-2.5 "
          onClick={() => {
            onClose()
            void signOut()
          }}
        >
          <LogOutIcon />
          Sign out
        </Button>
      </div>
    </div>
  ) : null

  return (
    <>
      {menu}
      {user && (
        <FriendRequestsDialog open={friendRequestsOpen} onOpenChange={setFriendRequestsOpen} />
      )}
    </>
  )
}
