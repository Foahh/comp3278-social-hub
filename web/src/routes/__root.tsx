import { Outlet, createRootRoute } from "@tanstack/react-router"

import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export const Route = createRootRoute({
  component: RootComponent,
})

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
