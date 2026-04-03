"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MenuIcon } from "lucide-react"

export function NavMain({
  items,
  className,
}: {
  items: {
    title: string
    url: string
    icon?: ReactNode
  }[]
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <nav className="hidden items-center gap-1 lg:flex">
        {items.map((item) => (
          <Button key={item.title} variant="ghost" size="sm" asChild>
            <a href={item.url} className="gap-2">
              {item.icon}
              <span>{item.title}</span>
            </a>
          </Button>
        ))}
      </nav>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {items.map((item) => (
            <DropdownMenuItem key={item.title} asChild>
              <a href={item.url} className="gap-2">
                {item.icon}
                {item.title}
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
