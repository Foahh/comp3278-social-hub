import { Outlet, createRootRoute, useRouter } from "@tanstack/react-router"

import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent,
})

function RootErrorComponent({ error }: { error: unknown }) {
  const router = useRouter()
  return (
    <ThemeProvider>
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
        <Button onClick={() => router.navigate({ to: "/" })}>Go home</Button>
      </div>
    </ThemeProvider>
  )
}

function RootComponent() {
  return (
    <ThemeProvider>
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <main className="flex-1 py-6">
          <Outlet />
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
