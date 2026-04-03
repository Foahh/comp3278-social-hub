import { SiteHeader } from "@/components/site-header"
import { Toaster } from "@/components/ui/sonner"

export function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1 py-6" />
      <Toaster />
    </div>
  )
}

export default App
