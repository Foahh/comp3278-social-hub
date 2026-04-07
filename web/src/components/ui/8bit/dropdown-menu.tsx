import type * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

import {
  DropdownMenu as ShadcnDropdownMenu,
  DropdownMenuCheckboxItem as ShadcnDropdownMenuCheckboxItem,
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuGroup as ShadcnDropdownMenuGroup,
  DropdownMenuItem as ShadcnDropdownMenuItem,
  DropdownMenuLabel as ShadcnDropdownMenuLabel,
  DropdownMenuPortal as ShadcnDropdownMenuPortal,
  DropdownMenuShortcut as ShadcnDropdownMenuShortcut,
  DropdownMenuSub as ShadcnDropdownMenuSub,
  DropdownMenuSubContent as ShadcnDropdownMenuSubContent,
  DropdownMenuSubTrigger as ShadcnDropdownMenuSubTrigger,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import "@/components/ui/8bit/styles/retro.css"

const DropdownMenu = ShadcnDropdownMenu

const DropdownMenuPortal = ShadcnDropdownMenuPortal

const DropdownMenuTrigger = ShadcnDropdownMenuTrigger

const DropdownMenuGroup = ShadcnDropdownMenuGroup

const DropdownMenuLabel = ShadcnDropdownMenuLabel

const DropdownMenuShortcut = ShadcnDropdownMenuShortcut

const DropdownMenuSub = ShadcnDropdownMenuSub

const DropdownMenuCheckboxItem = ShadcnDropdownMenuCheckboxItem

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuSubTrigger>) {
  return (
    <ShadcnDropdownMenuSubTrigger
      className={cn("rounded-none border-0 bg-transparent", className)}
      {...props}
    >
      {children}
    </ShadcnDropdownMenuSubTrigger>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.DropdownMenuSeparator>) {
  return (
    <DropdownMenuPrimitive.DropdownMenuSeparator
      data-slot="dropdown-menu-separator"
      className={cn(
        "-mx-1 my-1 h-0.5 shrink-0 bg-[linear-gradient(90deg,var(--foreground)_75%,transparent_75%)] bg-[length:16px_8px] dark:bg-[linear-gradient(90deg,var(--ring)_75%,transparent_75%)]",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <ShadcnDropdownMenuItem
      className={cn("rounded-none border-0 bg-transparent", className)}
      {...props}
    >
      {children}
    </ShadcnDropdownMenuItem>
  )
}

export const dropDownVariants = cva("", {
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

function DropdownMenuSubContent({
  children,
  className,
  font,
  ...props
}: BitDropownMenuContentProps) {
  return (
    <ShadcnDropdownMenuSubContent
      {...props}
      className={cn("bg-popover", font !== "normal" && "retro", className)}
    >
      {children}

      <div
        className="pointer-events-none absolute inset-0 border-x-[0.125rem] border-foreground dark:border-ring"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 border-y-[0.125rem] border-foreground dark:border-ring"
        aria-hidden="true"
      />
    </ShadcnDropdownMenuSubContent>
  )
}

export interface BitDropownMenuContentProps
  extends
    React.ComponentProps<typeof DropdownMenuPrimitive.Content>,
    VariantProps<typeof dropDownVariants> {}

function DropdownMenuContent({
  children,
  font,
  className,
  ...props
}: BitDropownMenuContentProps) {
  return (
    <ShadcnDropdownMenuContent
      className={cn(font !== "normal" && "retro", className)}
      {...props}
    >
      {children}

      <div
        className="pointer-events-none absolute inset-0 border-x-[0.125rem] border-foreground dark:border-ring"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 border-y-[0.125rem] border-foreground dark:border-ring"
        aria-hidden="true"
      />
    </ShadcnDropdownMenuContent>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuShortcut,
  DropdownMenuSub,
}
