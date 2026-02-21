import '@/env'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import { ConvexAuthSync } from '@/components/convex-auth-sync'
import { RootError } from '@/components/error'
import Header from '@/components/header'
import { NotFound } from '@/components/not-found'
import { UserProvider } from '@/contexts/user-context'
import ConvexProvider from '@/integrations/convex/provider'

import ClerkProvider from '@/integrations/clerk/provider'

import TanStackQueryProvider from '@/integrations/tanstack-query/provider'

import TanStackQueryDevtools from '@/integrations/tanstack-query/devtools'

import appCss from '@/styles.css?url'

import { ThemeProvider } from '@/components/theme/provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  // Protected routes use RequireAuth in _app (see Authenticated Routes: React context/hooks).
  notFoundComponent: NotFound,
  errorComponent: RootError,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Bluff',
      },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Sofia+Sans:ital,wght@0,1..1000;1,1..1000&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=DynaPuff:wght@400..700&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ClerkProvider>
          <ConvexProvider>
            <TanStackQueryProvider>
              <UserProvider>
                <ThemeProvider>
                  <TooltipProvider>
                    <ConvexAuthSync />
                    <Header />
                    {/* always have the same gap on sides */}
                    <main className="relative pt-32 px-16 mx-auto max-w-screen-2xl">
                      {children}
                    </main>
                    <Toaster />
                    {/* tanstack dev tools */}
                    <TanStackDevtools
                      config={{
                        position: 'bottom-left',
                      }}
                      plugins={[
                        {
                          name: 'Tanstack Router',
                          render: <TanStackRouterDevtoolsPanel />,
                        },
                        TanStackQueryDevtools,
                      ]}
                    />
                  </TooltipProvider>
                </ThemeProvider>
              </UserProvider>
            </TanStackQueryProvider>
          </ConvexProvider>
        </ClerkProvider>
        <Scripts />
      </body>
    </html>
  )
}
