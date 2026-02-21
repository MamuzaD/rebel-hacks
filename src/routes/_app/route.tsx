import { Outlet, createFileRoute } from '@tanstack/react-router'

// import { Grain } from '@/components/bg/grain'

export const Route = createFileRoute('/_app')({
  component: AppLayoutComponent,
})

function AppLayoutComponent() {
  return (
    <>
      <div className="mx-auto max-w-4xl mb-20">
        <Outlet />
      </div>
      {/* <Grain /> */}
    </>
  )
}
