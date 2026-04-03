import type * as TabsPrimitive from "@radix-ui/react-tabs"
import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

import {
  Tabs as ShadcnTabs,
  TabsContent as ShadcnTabsContent,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
} from "@/components/ui/tabs"

import "@/components/ui/8bit/styles/retro.css"

export const tabsVariants = cva("", {
  variants: {
    variant: {
      default: "bg-primary",
      retro: "retro",
    },
    font: {
      normal: "",
      retro: "retro",
    },
  },
  defaultVariants: {
    font: "retro",
  },
})

export interface BitTabsProps
  extends
    React.ComponentProps<typeof TabsPrimitive.Root>,
    VariantProps<typeof tabsVariants> {
  asChild?: boolean
}

function Tabs({ className, ...props }: BitTabsProps) {
  const { font } = props

  return (
    <ShadcnTabs
      {...props}
      className={cn("relative", font !== "normal" && "retro", className)}
    />
  )
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ShadcnTabsList>) {
  return (
    <ShadcnTabsList
      {...props}
      className={cn("relative rounded-none bg-card", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 -my-1.5 border-y-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute inset-0 -mx-1.5 border-x-6 border-foreground dark:border-ring"
        aria-hidden="true"
      />
      {children}
    </ShadcnTabsList>
  )
}

function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ShadcnTabsTrigger>) {
  return (
    <ShadcnTabsTrigger
      className={cn(
        "rounded-none border-none text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </ShadcnTabsTrigger>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnTabsContent>) {
  return <ShadcnTabsContent className={cn("", className)} {...props} />
}

export { Tabs, TabsList, TabsContent, TabsTrigger }
