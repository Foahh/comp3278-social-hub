import { Outlet, createRootRoute } from "@tanstack/react-router"

import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Home } from "pixelarticons/react"
import { LinkButton } from "@/components/ui/8bit/link-button"

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: RootErrorComponent,
})

function RootErrorComponent({ error }: { error: unknown }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred. Try refreshing the page."}
        </p>
        <LinkButton to="/" className="gap-2">
          <Home className="size-4 shrink-0" aria-hidden />
          Back to home
        </LinkButton>
      </div>
    </ThemeProvider>
  )
}

function RootComponent() {
  return (
    <ThemeProvider>
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <main className="min-h-0 flex-1 py-6">
          <Outlet />
        </main>
        <Toaster position="bottom-center" />
      </div>
    </ThemeProvider>
  )
}
