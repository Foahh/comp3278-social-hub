import { ChevronDownIcon } from "lucide-react"
import type { ComponentProps } from "react"
import { Search } from "pixelarticons/react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

import "@/components/ui/8bit/styles/retro.css"

export type TaskItemFileProps = ComponentProps<"div">

export const TaskItemFile = ({
  children,
  className,
  ...props
}: TaskItemFileProps) => (
  <div
    className={cn(
      "retro inline-flex items-center gap-1 rounded-none border-[0.125rem] border-foreground bg-secondary px-1.5 py-0.5 text-xs text-foreground dark:border-ring",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

export type TaskItemProps = ComponentProps<"div">

export const TaskItem = ({ children, className, ...props }: TaskItemProps) => (
  <div
    className={cn("retro text-sm text-muted-foreground", className)}
    {...props}
  >
    {children}
  </div>
)

export type TaskProps = ComponentProps<typeof Collapsible>

export const Task = ({
  defaultOpen = true,
  className,
  ...props
}: TaskProps) => (
  <Collapsible className={cn(className)} defaultOpen={defaultOpen} {...props} />
)

export type TaskTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
  title: string
}

export const TaskTrigger = ({
  children,
  className,
  title,
  ...props
}: TaskTriggerProps) => (
  <CollapsibleTrigger asChild className={cn("group", className)} {...props}>
    {children ?? (
      <div className="retro flex w-full cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <Search className="size-4" />
        <p className="text-sm">{title}</p>
        <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
      </div>
    )}
  </CollapsibleTrigger>
)

export type TaskContentProps = ComponentProps<typeof CollapsibleContent>

export const TaskContent = ({
  children,
  className,
  ...props
}: TaskContentProps) => (
  <CollapsibleContent
    className={cn(
      "text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2",
      className
    )}
    {...props}
  >
    <div className="mt-4 space-y-2 border-l-2 border-muted pl-4">
      {children}
    </div>
  </CollapsibleContent>
)

/** Demo component for preview */
export default function TaskDemo() {
  return (
    <div className="p-6" style={{ height: "200px" }}>
      <Task className="w-full">
        <TaskTrigger title="Found project files" />
        <TaskContent>
          <TaskItem>Searching "app/page.tsx, components structure"</TaskItem>
          <TaskItem>
            <span className="inline-flex items-center gap-1">
              Read{" "}
              <TaskItemFile>
                <span>page.tsx</span>
              </TaskItemFile>
            </span>
          </TaskItem>
          <TaskItem>Scanning 52 files</TaskItem>
          <TaskItem>
            <span className="inline-flex items-center gap-1">
              Reading files{" "}
              <TaskItemFile>
                <span>layout.tsx</span>
              </TaskItemFile>
            </span>
          </TaskItem>
        </TaskContent>
      </Task>
    </div>
  )
}
