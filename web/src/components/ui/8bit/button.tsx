import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

import { Button as ShadcnButton } from "@/components/ui/button"

import { PixelButtonDecor } from "./button-pixel-decor"

import "@/components/ui/8bit/styles/retro.css"

export const buttonVariants = cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro",
    },
    variant: {
      default: "bg-foreground",
      destructive: "bg-foreground",
      outline: "bg-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: {
      default: "",
      xs: "",
      sm: "",
      lg: "",
      icon: "",
      "icon-xs": "",
      "icon-sm": "",
      "icon-lg": "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface BitButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

function Button({
  children,
  asChild,
  className,
  font,
  variant,
  size,
  ...rest
}: BitButtonProps) {
  return (
    <ShadcnButton
      {...rest}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-none border-none transition-transform active:translate-y-1 disabled:cursor-not-allowed",
        size === "icon" && "mx-1 my-0",
        font !== "normal" && "retro",
        className
      )}
      size={size}
      variant={variant}
      asChild={asChild}
    >
      {asChild ? (
        <span className="relative inline-flex items-center justify-center gap-1.5">
          {children}
          <PixelButtonDecor variant={variant} size={size} />
        </span>
      ) : (
        <>
          {children}
          <PixelButtonDecor variant={variant} size={size} />
        </>
      )}
    </ShadcnButton>
  )
}

export { Button }
