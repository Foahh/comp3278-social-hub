import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useState } from "react"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import type { PromptInputMessage } from "@/components/ai/prompt-input"
import { useChat } from "@/features/chat/hooks/use-chat"
import { useChatModels } from "@/features/chat/hooks/use-chat-models"
import { ChatEmptyState } from "@/features/chat/components/chat-empty-state"
import { ChatMessageList } from "@/features/chat/components/chat-message"
import { ChatInput } from "@/features/chat/components/chat-input"

import "@/components/ui/8bit/styles/retro.css"

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: ChatPage,
})

function ChatPage() {
  const { q } = Route.useSearch()
  const [text, setText] = useState("")

  const {
    chatModels,
    selectedModelId,
    setSelectedModelId,
    selectedModel,
    chatMetadata,
    providerHeadings,
  } = useChatModels()

  const { messages, status, sendMessage, handleCopy, abortRef } = useChat({
    initialQuery: q,
    chatMetadata,
  })

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (abortRef.current) {
        abortRef.current.abort()
        return
      }
      const content = message.text.trim()
      if (!content) return
      setText("")
      void sendMessage(content)
    },
    [sendMessage, abortRef]
  )

  const handleSuggestion = useCallback(
    (s: string) => {
      if (status !== "ready") return
      void sendMessage(s)
    },
    [sendMessage, status]
  )

  return (
    <div className="flex h-[calc(100svh-3.5rem-1px-3rem)] flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <ChatEmptyState
              onSuggestion={handleSuggestion}
              disabled={status !== "ready"}
            />
          ) : (
            <ChatMessageList
              messages={messages}
              onCopy={handleCopy}
              onRetry={sendMessage}
            />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <ChatInput
        text={text}
        onTextChange={setText}
        status={status}
        onSubmit={handleSubmit}
        chatModels={chatModels}
        selectedModelId={selectedModelId}
        selectedModel={selectedModel}
        providerHeadings={providerHeadings}
        onSelectModel={setSelectedModelId}
      />
    </div>
  )
}
