"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function NavSecondary({
  items,
  className,
}: {
  items: {
    title: string
    url: string
    icon: React.ReactNode
  }[]
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {items.map((item) => (
        <Button
          key={item.title}
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          asChild
          title={item.title}
        >
          <a href={item.url}>
            {item.icon}
            <span className="sr-only">{item.title}</span>
          </a>
        </Button>
      ))}
    </div>
  )
}
