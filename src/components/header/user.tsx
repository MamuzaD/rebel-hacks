import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserAvatar,
  useAuth,
  useUser,
} from '@clerk/clerk-react'
import { useState, useRef, useEffect } from 'react'

import { ThemeButton } from '@/components/theme/button'
import { UserMenu } from '@/components/header/menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const userAvatarAppearance = {
  elements: {
    avatarBox: '!h-10 !w-10',
  },
}

function HeaderUserSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <Skeleton className="h-3.5 w-20 min-w-0 max-w-20 shrink-0" />
    </div>
  )
}

function SignedInUser() {
  const { user } = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handle = user?.username ?? user?.firstName
  const displayHandle = handle && `@${handle}`

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
        className="px-3 py-7"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <UserAvatar appearance={userAvatarAppearance} />
        {displayHandle && (
          <span className="min-w-0 max-w-20 truncate text-sm font-medium text-muted-foreground">
            {displayHandle}
          </span>
        )}
      </Button>

      <UserMenu open={dropdownOpen} onClose={closeDropdown} />
    </div>
  )
}

export default function HeaderUser() {
  const { isLoaded } = useAuth()

  if (!isLoaded) {
    return <HeaderUserSkeleton />
  }

  return (
    <>
      <SignedIn>
        <SignedInUser />
      </SignedIn>

      <SignedOut>
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <Button variant="ghost">Sign in</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button>Create account</Button>
          </SignUpButton>
          <ThemeButton />
        </div>
      </SignedOut>
    </>
  )
}
