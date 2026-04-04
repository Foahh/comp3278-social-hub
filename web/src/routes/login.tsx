import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/8bit/button"
import { LinkButton } from "@/components/ui/8bit/link-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/8bit/input-group"
import { AtSign, Lock, Login, UserPlus } from "pixelarticons/react"
import { useLogin } from "@/lib/api/hooks/useAuth"
import { appConstants } from "@/lib/appConstants"
import { toast } from "@/components/ui/8bit/toast"

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

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    login.mutate(
      {
        username: fd.get("username") as string,
        password: fd.get("password") as string,
      },
      {
        onSuccess: () => {
          toast.success("Welcome back!")
          void navigate({ to: redirectTo?.startsWith("/") ? redirectTo : "/" })
        },
        onError: (err) => setError(err.message),
      }
    )
  }

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Enter your username and password to continue.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" aria-hidden>
                      <AtSign className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="username"
                      name="username"
                      required
                      minLength={appConstants.usernameMinLen}
                      maxLength={appConstants.usernameMaxLen}
                      pattern="^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*"
                      title="Letters and numbers only. Use hyphens between parts (e.g. alice-01)."
                      autoComplete="username"
                    />
                  </InputGroup>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" aria-hidden>
                      <Lock className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={1}
                      autoComplete="current-password"
                    />
                  </InputGroup>
                </Field>
                {error ? (
                  <Field data-invalid>
                    <FieldError>{error}</FieldError>
                  </Field>
                ) : null}
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4 border-t">
              <Button
                type="submit"
                className="w-full"
                disabled={login.isPending}
              >
                <Login className="size-4 shrink-0" aria-hidden />
                {login.isPending ? "Signing in…" : "Sign in"}
              </Button>
              <FieldDescription className="text-center">
                Don't have an account?
                <br />
                <LinkButton
                  to="/register"
                  variant="link"
                  className="inline-flex h-auto min-h-0 items-center gap-1 p-0 text-sm"
                >
                  <UserPlus className="size-4 shrink-0" aria-hidden />
                  Sign up
                </LinkButton>
              </FieldDescription>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
