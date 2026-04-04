import { Database } from "pixelarticons/react"
import { ConversationEmptyState } from "@/components/ai/conversation"
import { Suggestion, Suggestions } from "@/components/ai/suggestion"
import { SUGGESTIONS } from "../constants"

interface ChatEmptyStateProps {
  onSuggestion: (suggestion: string) => void
  disabled: boolean
}

export function ChatEmptyState({
  onSuggestion,
  disabled,
}: ChatEmptyStateProps) {
  return (
    <ConversationEmptyState>
      <div className="space-y-4">
        <div className="text-center">
          <Database className="mx-auto size-8 text-muted-foreground" />
          <h3 className="retro mt-3 text-sm font-medium">Ask anything!</h3>
          <p className="retro mt-1 text-xs text-muted-foreground">
            I can analyze trends, and answer questions.
          </p>
        </div>
        <Suggestions wrap className="gap-2 pt-2">
          {SUGGESTIONS.map((s) => (
            <Suggestion
              key={s}
              suggestion={s}
              onClick={onSuggestion}
              disabled={disabled}
            />
          ))}
        </Suggestions>
      </div>
    </ConversationEmptyState>
  )
}
