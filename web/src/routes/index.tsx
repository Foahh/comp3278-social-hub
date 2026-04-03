import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")(  {
  component: FeedPage,
})

function FeedPage() {
  return <div className="mx-auto max-w-2xl px-4">Feed coming soon.</div>
}
