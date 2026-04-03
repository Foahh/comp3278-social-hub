import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { Textarea as ShadcnTextarea } from "@/components/ui/textarea"

import "@/components/ui/8bit/styles/retro.css"

export const inputVariants = cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro",
    },
  },
  defaultVariants: {
    font: "retro",
  },
})

export interface BitTextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean
}

function Textarea({ ...props }: BitTextareaProps) {
  const { className, font } = props

  return (
    <div className={cn("relative w-full", className)}>
      <ShadcnTextarea
        {...props}
        className={cn(
          "rounded-none border-0 ring-0 transition-transform",
          font !== "normal" && "retro",
          className
        )}
      />

      <div
        className="pointer-events-none absolute inset-0 -my-1.5 border-y-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />
    </div>
  )
}

export { Textarea }
