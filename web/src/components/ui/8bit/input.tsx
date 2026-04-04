import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { InputGroup, InputGroupInput } from "@/components/ui/8bit/input-group"

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

function Input({ className, font, ...props }: BitInputProps) {
  return (
    <InputGroup className={cn("w-full", className)}>
      <InputGroupInput
        className={font !== "normal" ? "retro" : undefined}
        {...props}
      />
    </InputGroup>
  )
}

export { Input }
