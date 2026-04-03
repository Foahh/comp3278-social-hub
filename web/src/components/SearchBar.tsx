import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Input } from "@/components/ui/8bit/input"
import { Button } from "@/components/ui/8bit/button"
import { SearchIcon } from "lucide-react"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    void navigate({ to: "/chat", search: { q: trimmed } })
    setQuery("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask anything about posts…"
        className="h-8 w-48 text-sm lg:w-64"
      />
      <Button type="submit" variant="ghost" size="icon" className="h-8 w-8" aria-label="Search">
        <SearchIcon className="size-4" />
      </Button>
    </form>
  )
}
