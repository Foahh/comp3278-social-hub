import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/8bit/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import "@/components/ui/8bit/styles/retro.css"

const inputGroupVariants = cva(
  [
    "group/input-group relative flex h-9 w-full min-w-0 items-center border-foreground bg-input/30 !p-0 outline-none transition-[color,border-color] dark:border-ring",
    "in-data-[slot=combobox-content]:focus-within:border-inherit",
    "has-[[data-slot=input-group-control]:focus-visible]:border-primary dark:has-[[data-slot=input-group-control]:focus-visible]:border-primary",
    "has-[[data-slot][aria-invalid=true]]:border-destructive dark:has-[[data-slot][aria-invalid=true]]:border-destructive/50",
    "has-[>textarea]:h-auto has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col",
    "has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3",
    "has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5",
  ],
  {
    variants: {
      variant: {
        default: "border-y-6",
        thin: "border-y-[0.125rem]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const inputGroupSideBorderVariants = cva(
  [
    "pointer-events-none absolute inset-0 border-foreground transition-[border-color] dark:border-ring",
    "group-has-[[data-slot=input-group-control]:focus-visible]/input-group:border-primary",
    "dark:group-has-[[data-slot=input-group-control]:focus-visible]/input-group:border-primary",
    "group-has-[[data-slot][aria-invalid=true]]/input-group:border-destructive",
    "dark:group-has-[[data-slot][aria-invalid=true]]/input-group:border-destructive/50",
  ],
  {
    variants: {
      variant: {
        default: "-mx-1.5 border-x-6",
        thin: "-mx-[0.125rem] border-x-[0.125rem]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function InputGroup({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupVariants>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(inputGroupVariants({ variant }), className)}
      {...props}
    >
      {children}
      <div
        className={inputGroupSideBorderVariants({ variant })}
        aria-hidden
      />
    </div>
  )
}

const inputGroupAddonVariants = cva(
  "relative z-[1] flex h-auto cursor-text items-center justify-center gap-2 py-2 text-sm font-medium text-muted-foreground select-none retro group-data-[disabled=true]/input-group:opacity-50 **:data-[slot=kbd]:bg-muted-foreground/10 **:data-[slot=kbd]:px-1.5 [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-2 has-[>button]:-ml-1 has-[>kbd]:ml-[-0.15rem]",
        "inline-end":
          "order-last pr-2 has-[>button]:-mr-1 has-[>kbd]:mr-[-0.15rem]",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-3 [.border-b]:pb-3",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-3 [.border-t]:pt-3",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement
          ?.querySelector("[data-slot=input-group-control]")
          ?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 rounded-none text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "",
        "icon-xs": "size-6 p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "retro flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "relative z-[1] flex-1 rounded-none border-0 bg-transparent px-3 py-1 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent retro",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "relative z-[1] flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent retro",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
