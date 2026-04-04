import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  XCircleIcon,
} from "lucide-react"
import type { NotificationChunk } from "../types"
import { cn } from "@/lib/utils"

const notificationIcons: Record<string, typeof InfoIcon> = {
  success: CheckCircle2Icon,
  error: XCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
}

const notificationColors: Record<string, string> = {
  success:
    "border-green-600/30 bg-green-50/50 text-green-800 dark:bg-green-950/30 dark:text-green-300",
  error: "border-destructive/30 bg-destructive/5 text-destructive",
  warning:
    "border-yellow-600/30 bg-yellow-50/50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300",
  info: "border-blue-600/30 bg-blue-50/50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
}

interface NotificationBannerProps {
  notification: NotificationChunk
}

export function NotificationBanner({ notification }: NotificationBannerProps) {
  const Icon = notificationIcons[notification.level] ?? InfoIcon
  const color =
    notificationColors[notification.level] ?? notificationColors.info

  return (
    <div
      className={cn(
        "retro my-2 flex items-start gap-2 rounded-none border-[0.125rem] px-3 py-2 text-xs",
        color
      )}
    >
      <Icon className="mt-0.5 size-3.5 shrink-0" />
      <span>{notification.message}</span>
    </div>
  )
}
