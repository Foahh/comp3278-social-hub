import type { ReactNode } from "react"
import { type VariantProps } from "class-variance-authority"
import { Link, type CreateLinkProps } from "@tanstack/react-router"

import { buttonVariants as shadcnButtonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { PixelButtonDecor } from "./button-pixel-decor"

import "@/components/ui/8bit/styles/retro.css"

export type LinkButtonProps = Omit<CreateLinkProps, "children" | "className"> &
  VariantProps<typeof shadcnButtonVariants> & {
    /** Match 8bit `Button`: default is retro; set `"normal"` to disable. */
    font?: "normal" | "retro" | null
    children?: ReactNode
    className?: string
  }

export function LinkButton({
  className,
  font,
  variant = "default",
  size = "default",
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      {...props}
      className={cn(
        shadcnButtonVariants({ variant, size }),
        "relative inline-flex shrink-0 items-center justify-center gap-1.5 rounded-none border-none transition-transform active:translate-y-1",
        size === "icon" && "mx-1 my-0",
        font !== "normal" && "retro",
        className
      )}
    >
      {children}
      <PixelButtonDecor variant={variant} size={size} />
    </Link>
  )
}
