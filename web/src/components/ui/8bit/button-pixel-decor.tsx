import type { VariantProps } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"]
type ButtonSize = VariantProps<typeof buttonVariants>["size"]

function StandardPixelFrame({
  variant,
  size,
}: {
  variant: ButtonVariant
  size: ButtonSize
}) {
  if (variant === "ghost" || variant === "link" || size === "icon") {
    return null
  }

  return (
    <>
      <div className="absolute -top-0.5 left-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute -top-0.5 right-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute -bottom-0.5 left-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute right-0.5 -bottom-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute top-0 left-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0 right-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute bottom-0 left-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute right-0 bottom-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0.5 -left-0.5 h-[calc(100%-4px)] w-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0.5 -right-0.5 h-[calc(100%-4px)] w-0.5 bg-foreground dark:bg-ring" />
      {variant !== "outline" && (
        <>
          <div className="absolute top-0 left-0 h-0.5 w-full bg-foreground/20" />
          <div className="absolute top-0.5 left-0 h-0.5 w-1.5 bg-foreground/20" />
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-foreground/20" />
          <div className="absolute right-0 bottom-0.5 h-0.5 w-1.5 bg-foreground/20" />
        </>
      )}
    </>
  )
}

function IconPixelFrame({ size }: { size: ButtonSize }) {
  if (size !== "icon") {
    return null
  }

  return (
    <>
      <div className="pointer-events-none absolute top-0 left-0 h-0.5 w-full bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute bottom-0 h-0.5 w-full bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute top-0.5 -left-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute bottom-0.5 -left-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute top-0.5 -right-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute -right-0.5 bottom-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
    </>
  )
}

export function PixelButtonDecor({
  variant,
  size,
}: {
  variant: ButtonVariant
  size: ButtonSize
}) {
  return (
    <>
      <StandardPixelFrame variant={variant} size={size} />
      <IconPixelFrame size={size} />
    </>
  )
}
