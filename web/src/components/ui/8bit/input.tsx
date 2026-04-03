import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { Input as ShadcnInput } from "@/components/ui/input"

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

export interface BitInputProps
  extends
    React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean
}

function Input({ ...props }: BitInputProps) {
  const { className, font } = props

  return (
    <div
      className={cn(
        "relative flex items-center border-y-6 border-foreground !p-0 dark:border-ring",
        className
      )}
    >
      <ShadcnInput
        {...props}
        className={cn(
          "!w-full rounded-none ring-0",
          font !== "normal" && "retro",
          className
        )}
      />

      <div
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />
    </div>
  )
}

export { Input }
