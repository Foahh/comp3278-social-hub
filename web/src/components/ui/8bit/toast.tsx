"use client"

import { toast as sonnerToast } from "sonner"

import { cn } from "@/lib/utils"

import "@/components/ui/8bit/styles/retro.css"

type ToastVariant = "default" | "success" | "error"

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
          "flex w-full items-center rounded-lg bg-background p-4 shadow-lg ring-1 ring-black/5 md:max-w-[364px]",
          variant === "error" && "text-destructive",
          variant === "success" && "text-foreground"
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
      <div className="absolute -bottom-0.5 right-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute top-0 left-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0 right-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute bottom-0 left-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute right-0 bottom-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0.5 -left-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute bottom-0.5 -left-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0.5 -right-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute bottom-0.5 -right-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
    </div>
  )
}
