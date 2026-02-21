import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser,
} from '@clerk/clerk-react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useRef, useState } from 'react'

import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

const userButtonAppearance = {
  elements: {
    userButtonAvatarBox: '!h-10 !w-10',
    userButtonTrigger: 'focus:shadow-none',
  },
}

function HeaderUserSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-24" />
      </div>
    </div>
  )
}

function ThemePopper({
  open,
  onOpenChange,
  setTheme,
  anchorPoint,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  anchorPoint: { x: number; y: number } | null
}) {
  const pick = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme)
    onOpenChange(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={
          <span
            className="pointer-events-none fixed size-0"
            style={
              anchorPoint
                ? { left: anchorPoint.x, top: anchorPoint.y }
                : { left: -9999, top: 0 }
            }
            aria-hidden
          />
        }
      />
      <DropdownMenuContent
        side="right"
        sideOffset={8}
        align="start"
        className="min-w-36"
      >
        <DropdownMenuItem onClick={() => pick('light')}>
          <Sun className="size-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => pick('dark')}>
          <Moon className="size-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => pick('system')}>
          <Monitor className="size-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SignedInUser() {
  const { user } = useUser()
  const { setTheme } = useTheme()
  const anchorRef = useRef<HTMLDivElement>(null)
  const [themePopupOpen, setThemePopupOpen] = useState(false)
  const [themeAnchorPoint, setThemeAnchorPoint] = useState<{
    x: number
    y: number
  } | null>(null)

  const emailPart = (user?.primaryEmailAddress?.emailAddress ?? '').split(
    '@',
  )[0]
  const handle = user?.username ?? (emailPart || (user?.firstName ?? 'Account'))

  const openThemePopper = () => {
    const rect = anchorRef.current?.getBoundingClientRect()
    if (rect) {
      setThemeAnchorPoint({ x: rect.right, y: rect.top + rect.height / 2 })
    }
    setThemePopupOpen(true)
  }

  return (
    <>
      <div ref={anchorRef} className="flex items-center gap-2">
        <UserButton appearance={userButtonAppearance}>
          <UserButton.MenuItems>
            <UserButton.Action
              label="Theme"
              labelIcon={<Sun className="size-4" />}
              onClick={openThemePopper}
            />
          </UserButton.MenuItems>
        </UserButton>
        <span className="text-sm font-medium text-muted-foreground">
          {handle.startsWith('@') ? handle : `@${handle}`}
        </span>
      </div>
      <ThemePopper
        open={themePopupOpen}
        onOpenChange={(open) => {
          setThemePopupOpen(open)
          if (!open) setThemeAnchorPoint(null)
        }}
        setTheme={setTheme}
        anchorPoint={themeAnchorPoint}
      />
    </>
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
        </div>
      </SignedOut>
    </>
  )
}
