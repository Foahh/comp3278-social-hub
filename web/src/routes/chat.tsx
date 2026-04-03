import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) ?? undefined,
  }),
  component: ChatPage,
})

function ChatPage() {
  const { q } = Route.useSearch()
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center text-muted-foreground">
      <p className="text-lg font-medium">AI Search</p>
      {q && <p className="mt-2 text-sm">Query: {q}</p>}
      <p className="mt-4 text-sm">Chat interface coming soon.</p>
    </div>
  )
}
