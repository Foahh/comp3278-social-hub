import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) ?? undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  return <div>Login coming soon.</div>
}
