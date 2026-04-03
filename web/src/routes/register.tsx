import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRegister } from "@/lib/api/hooks/useAuth"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPasswordError(null)
    const fd = new FormData(e.currentTarget)
    const password = fd.get("password") as string
    const confirm = fd.get("confirm") as string
    if (password !== confirm) {
      setPasswordError("Passwords do not match")
      return
    }
    register.mutate(
      {
        username: fd.get("username") as string,
        email: fd.get("email") as string,
        password,
      },
      {
        onSuccess: () => void navigate({ to: "/" }),
        onError: (err) => setError(err.message),
      },
    )
  }

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Pick a username, add your email, choose a password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username" name="username" required
                minLength={3} maxLength={50}
                pattern="^[a-zA-Z0-9_]+"
                title="Letters, numbers, and underscores only"
                autoComplete="username"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password" name="password" type="password"
                required minLength={8} maxLength={128} autoComplete="new-password"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm" name="confirm" type="password"
                required minLength={8} maxLength={128} autoComplete="new-password"
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending ? "Creating account…" : "Sign up"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
