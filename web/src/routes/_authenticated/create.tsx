import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/create")({
  component: CreatePostPage,
})

function CreatePostPage() {
  return <div>Create post coming soon.</div>
}
