import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Check, Database } from "pixelarticons/react"
import { nanoid } from "nanoid"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai/message"
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai/model-selector"
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai/prompt-input"
import { Shimmer } from "@/components/ai/shimmer"
import { Spinner } from "@/components/ui/8bit/spinner"
import client from "@/lib/api/client"
import { cn } from "@/lib/utils"

import "@/components/ui/8bit/styles/retro.css"

export const Route = createFileRoute("/chat")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: ChatPage,
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DataframeChunk {
  id: string
  data: Record<string, unknown>[]
  columns: string[]
  title?: string
  description?: string
}

interface UserMsg {
  id: string
  role: "user"
  content: string
}

interface AssistantMsg {
  id: string
  role: "assistant"
  text: string
  dataframes: DataframeChunk[]
  status?: string
  statusDetail?: string
  isStreaming: boolean
}

type ChatMsg = UserMsg | AssistantMsg

export interface WebsiteChatModel {
  id: string
  name: string
  provider: string
}

// ---------------------------------------------------------------------------
// SSE streaming helper — POST-based SSE via fetch + ReadableStream
// ---------------------------------------------------------------------------

async function* streamSSE(
  message: string,
  conversationId: string | null,
  signal: AbortSignal,
  metadata?: Record<string, string>
) {
  const body: Record<string, unknown> = { message }
  if (conversationId) body.conversation_id = conversationId
  if (metadata && Object.keys(metadata).length > 0) {
    body.metadata = metadata
  }

  const res = await fetch("/api/vanna/v2/chat_sse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
    signal,
  })

  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`)
  if (!res.body) throw new Error("No response body")

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith("data: ")) continue
      const payload = trimmed.slice(6)
      if (payload === "[DONE]") return
      try {
        yield JSON.parse(payload)
      } catch {
        /* skip malformed chunks */
      }
    }
  }
}

// ---------------------------------------------------------------------------
// DataTable — renders a Vanna dataframe chunk
// ---------------------------------------------------------------------------

function DataTable({ dataframe }: { dataframe: DataframeChunk }) {
  const { columns, data, title, description } = dataframe

  return (
    <div className="my-3 overflow-hidden rounded-none border-[0.125rem] border-foreground dark:border-ring">
      {(title || description) && (
        <div className="border-b border-border bg-muted/30 px-3 py-2">
          {title && (
            <div className="retro flex items-center gap-2 text-sm font-medium">
              <Database className="size-3.5 shrink-0 text-muted-foreground" />
              {title}
            </div>
          )}
          {description && (
            <p className="retro mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              {columns.map((col) => (
                <th
                  key={col}
                  className="retro px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b border-border last:border-0",
                  i % 2 === 0 ? "bg-background" : "bg-muted/10"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="retro px-3 py-1.5 text-xs whitespace-nowrap tabular-nums"
                  >
                    {row[col] != null ? String(row[col]) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="retro border-t border-border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
        {data.length} row{data.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatusIndicator — transient processing status
// ---------------------------------------------------------------------------

function StatusIndicator({
  message,
  detail,
}: {
  message: string
  detail?: string
}) {
  return (
    <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
      <Spinner className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="retro">{message}</span>
      {detail && <span className="retro text-xs opacity-70">· {detail}</span>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Suggestions shown in the empty state
// ---------------------------------------------------------------------------

const SUGGESTIONS = [
  "What are the most liked posts?",
  "Which users have the most posts?",
  "Show posts from this week",
  "What are the most commented posts?",
  "How many users are there?",
  "Who liked post #1?",
]

// ---------------------------------------------------------------------------
// ChatPage
// ---------------------------------------------------------------------------

function ChatPage() {
  const { q } = Route.useSearch()
  const navigate = useNavigate()

  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [text, setText] = useState("")
  const [status, setStatus] = useState<"ready" | "streaming">("ready")
  const [chatModels, setChatModels] = useState<WebsiteChatModel[]>([])
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const conversationIdRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const initialQuerySent = useRef(false)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const { data, error } = await client.GET("/api/config")
      if (cancelled || error || !data) {
        return
      }
      const raw = data as {
        chat?: { models?: WebsiteChatModel[]; defaultModel?: string | null }
      }
      const models = raw.chat?.models ?? []
      const def = raw.chat?.defaultModel ?? models[0]?.id ?? null
      setChatModels(models)
      setSelectedModelId(def)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const chatMetadata = useMemo(() => {
    if (!selectedModelId || !chatModels.some((m) => m.id === selectedModelId)) {
      return undefined
    }
    return { model: selectedModelId }
  }, [chatModels, selectedModelId])

  const providerHeadings = useMemo(
    () => [...new Set(chatModels.map((m) => m.provider))],
    [chatModels]
  )

  const selectedModel = chatModels.find((m) => m.id === selectedModelId)

  // ------ send a message and stream the response ------
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      const userMsg: UserMsg = {
        id: nanoid(),
        role: "user",
        content: content.trim(),
      }
      const aId = nanoid()
      const assistantMsg: AssistantMsg = {
        id: aId,
        role: "assistant",
        text: "",
        dataframes: [],
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setStatus("streaming")

      const ctrl = new AbortController()
      abortRef.current = ctrl

      try {
        for await (const chunk of streamSSE(
          content,
          conversationIdRef.current,
          ctrl.signal,
          chatMetadata
        )) {
          const rich = chunk.rich
          if (!rich) continue

          if (chunk.conversation_id) {
            conversationIdRef.current = chunk.conversation_id
          }

          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== aId || m.role !== "assistant") return m
              const msg = m as AssistantMsg

              switch (rich.type) {
                case "text":
                  return { ...msg, text: rich.data?.content ?? msg.text }

                case "dataframe":
                  return {
                    ...msg,
                    dataframes: [
                      ...msg.dataframes,
                      {
                        id: rich.id,
                        data: rich.data?.data ?? [],
                        columns: rich.data?.columns ?? [],
                        title: rich.data?.title,
                        description: rich.data?.description,
                      },
                    ],
                  }

                case "status_bar_update":
                  return rich.data?.status === "working"
                    ? {
                        ...msg,
                        status: rich.data.message,
                        statusDetail: rich.data.detail,
                      }
                    : { ...msg, status: undefined, statusDetail: undefined }

                default:
                  return msg
              }
            })
          )
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aId && m.role === "assistant"
              ? {
                  ...(m as AssistantMsg),
                  text:
                    (m as AssistantMsg).text ||
                    "Something went wrong. Please try again.",
                }
              : m
          )
        )
      } finally {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aId && m.role === "assistant"
              ? {
                  ...(m as AssistantMsg),
                  isStreaming: false,
                  status: undefined,
                  statusDetail: undefined,
                }
              : m
          )
        )
        setStatus("ready")
        abortRef.current = null
      }
    },
    [chatMetadata]
  )

  // ------ auto-send initial query from ?q= search param ------
  useEffect(() => {
    if (q && !initialQuerySent.current) {
      initialQuerySent.current = true
      void sendMessage(q)
      void navigate({ to: "/chat", search: { q: undefined }, replace: true })
    }
  }, [q, sendMessage, navigate])

  // ------ form submit handler ------
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
    [sendMessage]
  )

  return (
    <div className="flex h-[calc(100svh-3.5rem-1px-3rem)] flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto max-w-3xl">
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <div className="space-y-4">
                <div className="text-center">
                  <Database className="mx-auto size-8 text-muted-foreground" />
                  <h3 className="retro mt-3 text-sm font-medium">
                    Ask anything!
                  </h3>
                  <p className="retro mt-1 text-xs text-muted-foreground">
                    I can analyze trends, and answer questions.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void sendMessage(s)}
                      disabled={status !== "ready"}
                      className="retro rounded-none border-[0.125rem] border-foreground px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 dark:border-ring"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((msg) =>
              msg.role === "user" ? (
                <Message from="user" key={msg.id}>
                  <MessageContent>{msg.content}</MessageContent>
                </Message>
              ) : (
                <Message from="assistant" key={msg.id}>
                  {msg.isStreaming && msg.status && (
                    <StatusIndicator
                      message={msg.status}
                      detail={msg.statusDetail}
                    />
                  )}
                  {msg.dataframes.map((df) => (
                    <DataTable key={df.id} dataframe={df} />
                  ))}
                  {msg.text ? (
                    <MessageContent>
                      <MessageResponse>{msg.text}</MessageResponse>
                    </MessageContent>
                  ) : (
                    msg.isStreaming &&
                    !msg.status && (
                      <div className="py-1">
                        <Shimmer>Thinking...</Shimmer>
                      </div>
                    )
                  )}
                </Message>
              )
            )
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 border-t bg-background px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                {chatModels.length > 0 && selectedModel && (
                  <ModelSelector
                    onOpenChange={setModelSelectorOpen}
                    open={modelSelectorOpen}
                  >
                    <ModelSelectorTrigger asChild>
                      <PromptInputButton
                        disabled={status !== "ready"}
                        type="button"
                        variant="ghost"
                      >
                        <ModelSelectorLogo provider={selectedModel.provider} />
                        <ModelSelectorName>
                          {selectedModel.name}
                        </ModelSelectorName>
                      </PromptInputButton>
                    </ModelSelectorTrigger>
                    <ModelSelectorContent title="Model">
                      <ModelSelectorInput placeholder="Search models..." />
                      <ModelSelectorList>
                        <ModelSelectorEmpty>
                          No models found.
                        </ModelSelectorEmpty>
                        {providerHeadings.map((provider) => (
                          <ModelSelectorGroup heading={provider} key={provider}>
                            {chatModels
                              .filter((m) => m.provider === provider)
                              .map((m) => (
                                <ModelSelectorItem
                                  key={m.id}
                                  onSelect={() => {
                                    setSelectedModelId(m.id)
                                    setModelSelectorOpen(false)
                                  }}
                                  value={m.id}
                                >
                                  <ModelSelectorLogo provider={m.provider} />
                                  <ModelSelectorName>
                                    {m.name}
                                  </ModelSelectorName>
                                  {selectedModelId === m.id ? (
                                    <Check className="ml-auto size-4" />
                                  ) : (
                                    <div className="ml-auto size-4" />
                                  )}
                                </ModelSelectorItem>
                              ))}
                          </ModelSelectorGroup>
                        ))}
                      </ModelSelectorList>
                    </ModelSelectorContent>
                  </ModelSelector>
                )}
              </PromptInputTools>
              <PromptInputSubmit
                disabled={status === "ready" && !text.trim()}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
