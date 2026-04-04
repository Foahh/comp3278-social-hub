"use client"

import { toast as sonnerToast } from "sonner"

import { cn } from "@/lib/utils"

import "@/components/ui/8bit/styles/retro.css"

type ToastVariant = "default" | "success" | "error" | "warning" | "info"

function showToast(message: string, variant: ToastVariant = "default") {
  return sonnerToast.custom((id) => (
    <Toast id={id} title={message} variant={variant} />
  ))
}

/** 8-bit styled toasts (sonner `custom` + pixel frame). */
export const toast = {
  message: (msg: string) => showToast(msg, "default"),
  success: (msg: string) => showToast(msg, "success"),
  error: (msg: string) => showToast(msg, "error"),
  warning: (msg: string) => showToast(msg, "warning"),
  info: (msg: string) => showToast(msg, "info"),
}

interface ToastProps {
  id: string | number
  title: string
  variant: ToastVariant
}

function Toast(props: ToastProps) {
  const { title, variant } = props

  return (
    <div className="retro relative">
      <div
        className={cn(
          "flex w-full items-center rounded-lg border p-4 shadow-lg md:max-w-[364px]",
          variant === "default" &&
            "border-border bg-popover text-popover-foreground",
          variant === "success" &&
            "border-green-200 bg-green-100 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
          variant === "error" &&
            "border-red-200 bg-red-100 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
          variant === "warning" &&
            "border-amber-200 bg-amber-100 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
          variant === "info" &&
            "border-blue-200 bg-blue-100 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
        )}
      >
        <div className="flex flex-1 items-center">
          <div className="w-full">
            <p className="text-sm font-medium">{title}</p>
          </div>
        </div>
      </div>

      <div className="absolute -top-0.5 left-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute -top-0.5 right-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute -bottom-0.5 left-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute right-0.5 -bottom-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute top-0 left-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0 right-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute bottom-0 left-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute right-0 bottom-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0.5 -left-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute bottom-0.5 -left-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0.5 -right-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute -right-0.5 bottom-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
    </div>
  )
}
