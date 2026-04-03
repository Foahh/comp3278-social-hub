import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/8bit/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/8bit/input-group";
import { AtSign, Lock } from "pixelarticons/react";
import { useLogin } from "@/lib/api/hooks/useAuth";
import { appConstants } from "@/lib/appConstants";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: (search.redirect as string) ?? undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();
  const navigate = useNavigate();
  const login = useLogin();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    login.mutate(
      {
        username: fd.get("username") as string,
        password: fd.get("password") as string,
      },
      {
        onSuccess: () =>
          void navigate({ to: redirectTo?.startsWith("/") ? redirectTo : "/" }),
        onError: (err) => setError(err.message),
      },
    );
  }

  return (
    <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Enter your user name below to login to your account
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
                {login.isPending ? "Signing in…" : "Login"}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account?
                <br />
                <Link to="/register">Sign up</Link>
              </FieldDescription>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
