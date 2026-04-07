"use client"

import type * as React from "react"

import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const horizontalDash =
  "h-0.5 w-full shrink-0 bg-[length:16px_8px] bg-[linear-gradient(90deg,var(--foreground)_75%,transparent_75%)] dark:bg-[linear-gradient(90deg,var(--ring)_75%,transparent_75%)]"

const verticalDash =
  "h-full w-0.5 shrink-0 bg-[length:2px_16px] bg-[linear-gradient(0deg,var(--foreground)_75%,transparent_75%)] dark:bg-[linear-gradient(0deg,var(--ring)_75%,transparent_75%)]"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        orientation === "horizontal" ? horizontalDash : verticalDash,
        className
      )}
      {...props}
    />
  )
}

export { Separator }
