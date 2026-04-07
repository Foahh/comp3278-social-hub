import { ArrowDown } from "pixelarticons/react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { useCallback } from "react"
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom"
import { Button } from "@/components/ui/8bit/button"
import { ScrollBar } from "@/components/ui/8bit/scroll-area"
import { cn } from "@/lib/utils"
import { Message, MessageContent } from "@/components/ai/message"

import "@/components/ui/8bit/styles/retro.css"

export type ConversationProps = ComponentProps<typeof StickToBottom>

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn("relative flex-1 overflow-y-hidden", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
)

export type ConversationContentProps = ComponentProps<"div">

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => {
  const { scrollRef, contentRef } = useStickToBottomContext()

  return (
    <ScrollAreaPrimitive.Root
      className="relative h-full min-h-0 w-full"
      data-slot="conversation-scroll-area"
    >
      <ScrollAreaPrimitive.Viewport
        ref={scrollRef}
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        <div
          ref={contentRef}
          className={cn("flex flex-col gap-8 p-4", className)}
          {...props}
        />
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string
  description?: string
  icon?: React.ReactNode
}

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="retro text-sm font-medium">{title}</h3>
          {description && (
            <p className="retro text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </>
    )}
  </div>
)

export type ConversationScrollButtonProps = ComponentProps<typeof Button>

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext()

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom()
  }, [scrollToBottom])

  return (
    !isAtBottom && (
      <Button
        className={cn(
          "absolute bottom-4 left-[50%] translate-x-[-50%] bg-background hover:bg-muted",
          className
        )}
        onClick={handleScrollToBottom}
        size="icon"
        type="button"
        variant="outline"
        {...props}
      >
        <ArrowDown className="size-4" />
      </Button>
    )
  )
}

/** Demo component for preview */
export default function ConversationDemo() {
  const messages = [
    { id: "1", from: "user" as const, text: "Hello, how are you?" },
    {
      id: "2",
      from: "assistant" as const,
      text: "I'm good, thank you! How can I assist you today?",
    },
    {
      id: "3",
      from: "user" as const,
      text: "I'm looking for information about your services.",
    },
    {
      id: "4",
      from: "assistant" as const,
      text: "Sure! We offer a variety of AI solutions. What are you interested in?",
    },
  ]

  return (
    <Conversation className="relative size-full p-4">
      <ConversationContent>
        {messages.map((msg) => (
          <Message from={msg.from} key={msg.id}>
            <MessageContent>{msg.text}</MessageContent>
          </Message>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
