import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Search } from "pixelarticons/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/8bit/input-group"

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
    <form onSubmit={handleSubmit} className="flex items-center">
      <InputGroup variant="thin" className="h-8 w-48 text-sm lg:w-64">
        <InputGroupAddon align="inline-start" aria-hidden>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="…"
          aria-label="Search"
          name="q"
          className="min-h-0 py-0 !h-8"
        />
      </InputGroup>
    </form>
  )
}
