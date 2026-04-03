import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLogin } from "@/lib/api/hooks/useAuth"

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: (search.redirect as string) ?? undefined,
  }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch()
  const navigate = useNavigate()
  const login = useLogin()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    login.mutate(
      { email: fd.get("email") as string, password: fd.get("password") as string },
      {
        onSuccess: () => void navigate({ to: redirectTo?.startsWith("/") ? redirectTo : "/" }),
        onError: (err) => setError(err.message),
      },
    )
  }

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Enter your email and password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password" name="password" type="password"
                required minLength={1} autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="underline underline-offset-4 hover:text-foreground">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
