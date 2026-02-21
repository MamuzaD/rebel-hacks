import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-muted-foreground mt-1">
        Your profile page. Manage your account via the header menu.
      </p>
    </div>
  )
}
