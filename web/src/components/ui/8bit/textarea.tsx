import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

import {
  InputGroup,
  InputGroupTextarea,
} from "@/components/ui/8bit/input-group"

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

function Textarea({ className, font, ...props }: BitTextareaProps) {
  return (
    <InputGroup>
      <InputGroupTextarea
        className={cn(
          font === "normal" && "font-sans tracking-normal",
          className
        )}
        {...props}
      />
    </InputGroup>
  )
}

export { Textarea }
