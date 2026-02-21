import { useAuth } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

import { Hero } from '@/components/home/hero'

const Grain = lazy(() =>
  import('@/components/bg/grain').then((m) => ({ default: m.Grain })),
)

export const Route = createFileRoute('/')({ component: IndexComponent })

function IndexComponent() {
  const { isLoaded, isSignedIn } = useAuth()
  const year = new Date().getFullYear()

  if (!isLoaded) {
    return null
  }

  // if (isSignedIn) {
  //   return <Navigate to="/" />
  // }

  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <Grain />
      </Suspense>
      <div className="fixed bottom-1 left-1/2 -translate-x-1/2">
        <h3 className="font-medium text-background">
          Built by Daniel, Bluff © {year}
        </h3>
      </div>
    </>
  )
}
