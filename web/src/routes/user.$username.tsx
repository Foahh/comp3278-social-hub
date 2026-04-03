import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/user/$username")({
  component: UserProfilePage,
})

function UserProfilePage() {
  return <div>Profile coming soon.</div>
}
