import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/post/$id")({
  component: PostDetailPage,
})

function PostDetailPage() {
  return <div>Post detail coming soon.</div>
}
