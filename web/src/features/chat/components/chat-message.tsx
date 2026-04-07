import { Copy, Redo } from "pixelarticons/react"
import { Actions, Action } from "@/components/ai/actions"
import { Loader } from "@/components/ai/loader"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai/message"
import { Shimmer } from "@/components/ai/shimmer"
import type { AssistantMsg, ChatMsg, UserMsg } from "../types"
import { DataTable } from "./data-table"
import { NotificationBanner } from "./notification-banner"
import { CardDisplay } from "./card-display"
import { cn } from "@/lib/utils"

interface ChatMessageListProps {
  messages: ChatMsg[]
  onCopy: (msg: AssistantMsg) => void
  onRetry: (assistantMsgId: string, content: string) => void
  actionsClassName?: string
}

export function ChatMessageList({
  messages,
  onCopy,
  onRetry,
  actionsClassName,
}: ChatMessageListProps) {
  return (
    <>
      {messages.map((msg) =>
        msg.role === "user" ? (
          <UserMessage key={msg.id} msg={msg} />
        ) : (
          <AssistantMessage
            key={msg.id}
            msg={msg}
            messages={messages}
            onCopy={onCopy}
            onRetry={onRetry}
            actionsClassName={actionsClassName}
          />
        )
      )}
    </>
  )
}

function UserMessage({ msg }: { msg: UserMsg }) {
  return (
    <Message from="user">
      <MessageContent>{msg.content}</MessageContent>
    </Message>
  )
}

interface AssistantMessageProps {
  msg: AssistantMsg
  messages: ChatMsg[]
  onCopy: (msg: AssistantMsg) => void
  onRetry: (assistantMsgId: string, content: string) => void
  actionsClassName?: string
}

function AssistantMessage({
  msg,
  messages,
  onCopy,
  onRetry,
  actionsClassName,
}: AssistantMessageProps) {
  const handleRetry = () => {
    const msgIdx = messages.indexOf(msg)
    let prev: UserMsg | undefined
    for (let i = msgIdx - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        prev = messages[i] as UserMsg
        break
      }
    }
    if (prev) onRetry(msg.id, prev.content)
  }

  return (
    <Message from="assistant">
      {/* Transient status while streaming */}
      {msg.isStreaming && msg.status && (
        <div className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
          <Loader className="size-3.5 shrink-0" />
          <span className="retro">{msg.status}</span>
          {msg.statusDetail && (
            <span className="retro text-xs opacity-70">
              · {msg.statusDetail}
            </span>
          )}
        </div>
      )}

      {/* Notifications */}
      {msg.notifications.map((n) => (
        <NotificationBanner key={n.id} notification={n} />
      ))}

      {/* Cards */}
      {msg.cards.map((c) => (
        <CardDisplay key={c.id} card={c} />
      ))}

      {/* Data tables */}
      {msg.dataframes.map((df) => (
        <DataTable key={df.id} dataframe={df} />
      ))}

      {/* Text response */}
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

      {/* Actions (copy / retry) — only when done streaming */}
      {!msg.isStreaming && msg.text && (
        <Actions className={cn(actionsClassName, "mt-2")}>
          <Action tooltip="Copy" onClick={() => onCopy(msg)}>
            <Copy className="size-4" />
          </Action>
          <Action tooltip="Retry" onClick={handleRetry}>
            <Redo className="size-4" />
          </Action>
        </Actions>
      )}
    </Message>
  )
}
