import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { Button as ShadcnButton } from "@/components/ui/button";

import "@/components/ui/8bit/styles/retro.css";

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
});

export interface BitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
type ButtonSize = VariantProps<typeof buttonVariants>["size"];

function StandardPixelFrame({
  variant,
  size,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
}) {
  if (variant === "ghost" || variant === "link" || size === "icon") {
    return null;
  }

  return (
    <>
      <div className="absolute -top-0.5 left-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute -top-0.5 right-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute -bottom-0.5 left-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute -bottom-0.5 right-0.5 h-0.5 w-1/2 bg-foreground dark:bg-ring" />
      <div className="absolute top-0 left-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0 right-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute bottom-0 left-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute bottom-0 right-0 size-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0.5 -left-0.5 h-[calc(100%-4px)] w-0.5 bg-foreground dark:bg-ring" />
      <div className="absolute top-0.5 -right-0.5 h-[calc(100%-4px)] w-0.5 bg-foreground dark:bg-ring" />
      {variant !== "outline" && (
        <>
          <div className="absolute top-0 left-0 h-0.5 w-full bg-foreground/20" />
          <div className="absolute top-0.5 left-0 h-0.5 w-1.5 bg-foreground/20" />
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-foreground/20" />
          <div className="absolute bottom-0.5 right-0 h-0.5 w-1.5 bg-foreground/20" />
        </>
      )}
    </>
  );
}

function IconPixelFrame({ size }: { size: ButtonSize }) {
  if (size !== "icon") {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none absolute top-0 left-0 h-0.5 w-full bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute bottom-0 h-0.5 w-full bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute top-0.5 -left-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute bottom-0.5 -left-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute top-0.5 -right-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
      <div className="pointer-events-none absolute bottom-0.5 -right-0.5 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
    </>
  );
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
        "relative inline-flex items-center justify-center gap-1.5 rounded-none border-none transition-transform hover:rounded-none focus-visible:rounded-none aria-expanded:rounded-none data-[state=open]:rounded-none active:translate-y-1",
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
          <StandardPixelFrame variant={variant} size={size} />
          <IconPixelFrame size={size} />
        </span>
      ) : (
        <>
          {children}
          <StandardPixelFrame variant={variant} size={size} />
          <IconPixelFrame size={size} />
        </>
      )}
    </ShadcnButton>
  );
}

export { Button };
