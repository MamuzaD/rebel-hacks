import { SignInButton, SignUpButton, SignedIn, SignedOut, useAuth } from '@clerk/clerk-react'

import { HeaderUserSkeleton } from '@/components/header/header-user-skeleton'
import { SignedInUser } from '@/components/header/signed-in-user'
import { ThemeButton } from '@/components/theme/button'
import { Button } from '@/components/ui/button'

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
          <SignInButton mode="modal" forceRedirectUrl="/feed" fallbackRedirectUrl="/feed">
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
