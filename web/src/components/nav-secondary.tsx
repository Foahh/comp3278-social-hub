"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { NavSecondaryItem } from "@/lib/navigation"
import { Link } from "@tanstack/react-router"

export function NavSecondary({
  items,
  className,
}: {
  items: NavSecondaryItem[]
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
          <Link to={item.to}>
            {item.icon}
            <span className="sr-only">{item.title}</span>
          </Link>
        </Button>
      ))}
    </div>
  )
}
