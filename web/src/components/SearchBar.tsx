import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Search } from "pixelarticons/react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
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
      <InputGroup className="h-8 w-48 items-stretch text-sm lg:w-64">
        <InputGroupInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything…"
          aria-label="Search anything"
          name="q"
          className="min-h-0 h-full min-w-0 py-0"
        />
        <InputGroupAddon
          align="inline-end"
          className="flex items-stretch self-stretch py-0 pr-0 has-[>button]:m-0"
        >
          <InputGroupButton
            type="submit"
            size="icon-sm"
            aria-label="Submit search"
            title="Search"
            className="!h-full !min-h-0 !w-8 shrink-0 rounded-none border-l border-foreground/30 bg-muted text-foreground transition-colors hover:bg-accent hover:text-accent-foreground dark:border-ring/50"
          >
            <Search className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}
