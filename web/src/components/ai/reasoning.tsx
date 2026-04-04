"use client"

import { useControllableState } from "@radix-ui/react-use-controllable-state"
import { ChevronDown, Lightbulb } from "pixelarticons/react"
import type { ComponentProps, ReactNode } from "react"
import { createContext, memo, useContext, useEffect, useState } from "react"
import { Streamdown } from "streamdown"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { Shimmer } from "@/components/ai/shimmer"

import "@/components/ui/8bit/styles/retro.css"

interface ReasoningContextValue {
  isStreaming: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  duration: number | undefined
}

const ReasoningContext = createContext<ReasoningContextValue | null>(null)

export const useReasoning = () => {
  const context = useContext(ReasoningContext)
  if (!context) {
    throw new Error("Reasoning components must be used within Reasoning")
  }
  return context
}

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  duration?: number
}

const AUTO_CLOSE_DELAY = 1000
const MS_IN_S = 1000

export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen = true,
    onOpenChange,
    duration: durationProp,
    children,
    ...props
  }: ReasoningProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    })
    const [duration, setDuration] = useControllableState({
      prop: durationProp,
      defaultProp: undefined,
    })

    const [hasAutoClosed, setHasAutoClosed] = useState(false)
    const [startTime, setStartTime] = useState<number | null>(null)

    // Track duration when streaming starts and ends
    useEffect(() => {
      if (isStreaming) {
        if (startTime === null) {
          setStartTime(Date.now())
        }
      } else if (startTime !== null) {
        setDuration(Math.ceil((Date.now() - startTime) / MS_IN_S))
        setStartTime(null)
      }
    }, [isStreaming, startTime, setDuration])

    // Auto-open when streaming starts, auto-close when streaming ends (once only)
    useEffect(() => {
      if (defaultOpen && !isStreaming && isOpen && !hasAutoClosed) {
        // Add a small delay before closing to allow user to see the content
        const timer = setTimeout(() => {
          setIsOpen(false)
          setHasAutoClosed(true)
        }, AUTO_CLOSE_DELAY)

        return () => clearTimeout(timer)
      }
    }, [isStreaming, isOpen, defaultOpen, setIsOpen, hasAutoClosed])

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen)
    }

    return (
      <ReasoningContext.Provider
        value={{ isStreaming, isOpen, setIsOpen, duration }}
      >
        <Collapsible
          className={cn(
            "not-prose mb-4 rounded-none border-[0.125rem] border-foreground bg-muted/20 p-3 dark:border-ring",
            className
          )}
          onOpenChange={handleOpenChange}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    )
  }
)

export type ReasoningTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  getThinkingMessage?: (isStreaming: boolean, duration?: number) => ReactNode
}

const defaultGetThinkingMessage = (isStreaming: boolean, duration?: number) => {
  if (isStreaming || duration === 0) {
    return <Shimmer duration={1}>Thinking...</Shimmer>
  }
  if (duration === undefined) {
    return <p className="retro m-0">Thought for a few seconds</p>
  }
  return <p className="retro m-0">Thought for {duration} seconds</p>
}

export const ReasoningTrigger = memo(
  ({
    className,
    children,
    getThinkingMessage = defaultGetThinkingMessage,
    ...props
  }: ReasoningTriggerProps) => {
    const { isStreaming, isOpen, duration } = useReasoning()

    return (
      <CollapsibleTrigger
        className={cn(
          "retro flex w-full items-center gap-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground",
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            <Lightbulb className="size-4" />
            {getThinkingMessage(isStreaming, duration)}
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                isOpen ? "rotate-180" : "rotate-0"
              )}
            />
          </>
        )}
      </CollapsibleTrigger>
    )
  }
)

export type ReasoningContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  children: string
}

export const ReasoningContent = memo(
  ({ className, children, ...props }: ReasoningContentProps) => (
    <CollapsibleContent
      className={cn(
        "retro mt-4 border-t border-border pt-4 text-sm",
        "text-muted-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2",
        className
      )}
      {...props}
    >
      <Streamdown className="retro">{children}</Streamdown>
    </CollapsibleContent>
  )
)

Reasoning.displayName = "Reasoning"
ReasoningTrigger.displayName = "ReasoningTrigger"
ReasoningContent.displayName = "ReasoningContent"

/** Demo component for preview */
export default function ReasoningDemo() {
  return (
    <div className="w-full max-w-2xl p-6">
      <Reasoning defaultOpen={true} duration={12}>
        <ReasoningTrigger />
        <ReasoningContent>
          Let me think through this step by step... First, I need to consider
          the user's requirements. They want a solution that is both efficient
          and maintainable. Looking at the codebase, I can see several potential
          approaches: 1. **Refactor the existing module** - This would minimize
          disruption 2. **Create a new abstraction layer** - More work but
          cleaner long-term 3. **Use a library solution** - Fastest but adds a
          dependency After weighing the tradeoffs, I believe option 2 provides
          the best balance of maintainability and performance.
        </ReasoningContent>
      </Reasoning>
    </div>
  )
}
