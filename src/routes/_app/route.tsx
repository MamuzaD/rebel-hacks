import { Outlet, createFileRoute } from '@tanstack/react-router'

import { Grain } from '@/components/bg/grain'

export const Route = createFileRoute('/_app')({
  component: AppLayoutComponent,
})

function AppLayoutComponent() {
  return (
    <>
      <div className="relative z-10 mx-auto max-w-md ">
        <Outlet />
      </div>
      <Grain />
    </>
  )
}
