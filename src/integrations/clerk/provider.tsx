import { ClerkProvider } from '@clerk/clerk-react'
import { shadcn } from '@clerk/themes'

import { env } from '@/env'

export default function AppClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{ theme: shadcn }}
    >
      {children}
    </ClerkProvider>
  )
}
