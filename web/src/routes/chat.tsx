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
      <p className="text-lg font-medium text-foreground">Search assistant</p>
      {q ? (
        <p className="mt-2 text-sm">
          You searched for: <span className="font-medium">{q}</span>
        </p>
      ) : null}
      <p className="mt-4 text-sm">AI search isn't available yet.</p>
    </div>
  )
}
