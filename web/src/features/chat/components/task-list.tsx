import { CheckCircle2Icon, CircleDotIcon, XCircleIcon } from "lucide-react"
import { Task, TaskContent, TaskItem, TaskTrigger } from "@/components/ai/task"
import type { TaskChunk } from "../types"

interface TaskListProps {
  tasks: TaskChunk[]
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) return null

  const completedCount = tasks.filter((t) => t.status === "completed").length
  const allDone = completedCount === tasks.length

  return (
    <Task defaultOpen={!allDone}>
      <TaskTrigger
        title={
          allDone
            ? `Completed ${tasks.length} step${tasks.length !== 1 ? "s" : ""}`
            : `Processing (${completedCount}/${tasks.length})`
        }
      />
      <TaskContent>
        {tasks.map((t) => (
          <TaskItem key={t.id} className="flex items-center gap-2">
            {t.status === "completed" ? (
              <CheckCircle2Icon className="size-3.5 shrink-0 text-green-600" />
            ) : t.status === "failed" ? (
              <XCircleIcon className="size-3.5 shrink-0 text-destructive" />
            ) : (
              <CircleDotIcon className="size-3.5 shrink-0 animate-pulse text-muted-foreground" />
            )}
            <span>{t.title}</span>
            {t.description && (
              <span className="text-xs opacity-60">— {t.description}</span>
            )}
          </TaskItem>
        ))}
      </TaskContent>
    </Task>
  )
}
