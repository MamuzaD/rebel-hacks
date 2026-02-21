import { SignOutButton, useClerk } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { LayoutListIcon, UserIcon } from 'lucide-react'

import { ThemeToggle } from '@/components/theme/toggle'
import { Button } from '@/components/ui/button'

const linkItemClass =
  'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-muted hover:text-foreground focus-visible:bg-muted [&_svg]:size-4'

type UserMenuProps = {
  open: boolean
  onClose: () => void
}

export function UserMenu({ open, onClose }: UserMenuProps) {
  const { openUserProfile } = useClerk()

  return (
    open && (
      <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-popover p-4 shadow-lg border border-border z-50">
        {/* Profile link */}
        <Link to="/feed" className={linkItemClass} onClick={onClose}>
          <LayoutListIcon />
          Feed
        </Link>

        <Link to="/profile" className={linkItemClass} onClick={onClose}>
          <UserIcon />
          Profile
        </Link>

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
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Theme
          </p>
          <ThemeToggle />
        </div>

        {/* Sign out */}
        <div className="mt-1 border-t border-border/50 pt-2">
          <SignOutButton>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-xl gap-2.5"
              onClick={onClose}
            >
              Sign out
            </Button>
          </SignOutButton>
        </div>
      </div>
    )
  )
}
