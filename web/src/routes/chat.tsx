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

  const { messages, status, sendMessage, retryMessage, handleCopy, abortRef } =
    useChat({
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
    <div className="flex h-full min-h-0 flex-col rounded-none">
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
              onRetry={retryMessage}
              actionsClassName="-translate-x-[2px]"
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
