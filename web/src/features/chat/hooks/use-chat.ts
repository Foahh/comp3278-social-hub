import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { nanoid } from "nanoid"
import { toast } from "sonner"
import type { AssistantMsg, ChatMsg, UserMsg } from "../types"
import { streamSSE } from "../api/stream-sse"

interface UseChatOptions {
  initialQuery?: string
  chatMetadata?: Record<string, string>
}

export function useChat({ initialQuery, chatMetadata }: UseChatOptions) {
  const navigate = useNavigate()

  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [status, setStatus] = useState<"ready" | "streaming">("ready")
  const conversationIdRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const initialQuerySent = useRef(false)

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
        tasks: [],
        notifications: [],
        cards: [],
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

                case "task_tracker_update": {
                  const op = rich.data?.operation
                  if (op === "add_task" && rich.data?.task) {
                    const t = rich.data.task
                    return {
                      ...msg,
                      tasks: [
                        ...msg.tasks,
                        {
                          id: t.id,
                          title: t.title ?? "Working...",
                          description: t.description,
                          status: t.status ?? "pending",
                        },
                      ],
                    }
                  }
                  if (op === "update_task" && rich.data?.task_id) {
                    return {
                      ...msg,
                      tasks: msg.tasks.map((t) =>
                        t.id === rich.data.task_id
                          ? { ...t, status: rich.data.status ?? t.status }
                          : t
                      ),
                    }
                  }
                  if (op === "remove_task" && rich.data?.task_id) {
                    return {
                      ...msg,
                      tasks: msg.tasks.filter(
                        (t) => t.id !== rich.data.task_id
                      ),
                    }
                  }
                  return msg
                }

                case "notification":
                  return {
                    ...msg,
                    notifications: [
                      ...msg.notifications,
                      {
                        id: rich.id,
                        message: rich.data?.message ?? "",
                        level: rich.data?.level ?? "info",
                      },
                    ],
                  }

                case "card":
                case "status_card":
                  return {
                    ...msg,
                    cards: [
                      ...msg.cards,
                      {
                        id: rich.id,
                        title: rich.data?.title,
                        content: rich.data?.content,
                        status: rich.data?.status,
                        description: rich.data?.description,
                        icon: rich.data?.icon,
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

  // Auto-send initial query from ?q= search param
  useEffect(() => {
    if (initialQuery && !initialQuerySent.current) {
      initialQuerySent.current = true
      void sendMessage(initialQuery)
      void navigate({ to: "/chat", search: { q: undefined }, replace: true })
    }
  }, [initialQuery, sendMessage, navigate])

  const handleCopy = useCallback((msg: AssistantMsg) => {
    const parts: string[] = []
    if (msg.text) parts.push(msg.text)
    for (const df of msg.dataframes) {
      if (df.columns.length > 0 && df.data.length > 0) {
        const header = df.columns.join("\t")
        const rows = df.data.map((r) =>
          df.columns.map((c) => r[c] ?? "").join("\t")
        )
        parts.push([header, ...rows].join("\n"))
      }
    }
    void navigator.clipboard.writeText(parts.join("\n\n")).then(() => {
      toast.success("Copied to clipboard")
    })
  }, [])

  const abort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return {
    messages,
    status,
    sendMessage,
    handleCopy,
    abort,
    abortRef,
  }
}
