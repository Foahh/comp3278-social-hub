import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/8bit/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { AtSign, Lock, User } from "pixelarticons/react"
import { useRegister } from "@/lib/api/hooks/useAuth"
import { appConstants } from "@/lib/appConstants"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegister()
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
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
        name: fd.get("name") as string,
        password,
      },
      {
        onSuccess: () => void navigate({ to: "/" }),
        onError: (err) => setError(err.message),
      }
    )
  }

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" aria-hidden>
                      <User className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="name"
                      name="name"
                      maxLength={appConstants.nameMaxLength}
                      autoComplete="name"
                    />
                  </InputGroup>
                  <FieldDescription>
                    Up to {appConstants.nameMaxLength} characters; leave blank
                    if you prefer.
                  </FieldDescription>
                </Field>
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
                      title="Letters and numbers, hyphens between segments (e.g. alice-01)"
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
                      minLength={appConstants.passwordMinLength}
                      maxLength={appConstants.passwordMaxLength}
                      autoComplete="new-password"
                    />
                  </InputGroup>
                  <FieldDescription>
                    Must be at least {appConstants.passwordMinLength} characters
                    long.
                  </FieldDescription>
                </Field>
                <Field data-invalid={!!passwordError}>
                  <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" aria-hidden>
                      <Lock className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="confirm"
                      name="confirm"
                      type="password"
                      required
                      minLength={appConstants.passwordMinLength}
                      maxLength={appConstants.passwordMaxLength}
                      autoComplete="new-password"
                      aria-invalid={!!passwordError}
                    />
                  </InputGroup>
                  <FieldDescription>
                    Please confirm your password.
                  </FieldDescription>
                  {passwordError ? (
                    <FieldError>{passwordError}</FieldError>
                  ) : null}
                </Field>
                {error ? (
                  <Field data-invalid>
                    <FieldError>{error}</FieldError>
                  </Field>
                ) : null}
                <Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={register.isPending}
                  >
                    {register.isPending
                      ? "Creating account…"
                      : "Create account"}
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account?{" "}
                    <Link to="/login" search={{}}>
                      Sign in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
