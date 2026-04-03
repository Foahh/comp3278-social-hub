import type React from "react";
import { forwardRef } from "react";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import "@/components/ui/8bit/styles/retro.css";

export const avatarVariants = cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro",
    },
    variant: {
      default: "",
      retro: "",
      pixel: "",
    },
  },
  defaultVariants: {
    font: "retro",
    variant: "pixel",
  },
});

const Avatar = forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    font?: "normal" | "retro";
    variant?: "default" | "retro" | "pixel";
    overlay?: React.ReactNode;
  }
>(({ className = "", font, variant = "retro", overlay, ...props }, ref) => {
  const isPixel = variant === "pixel";

  return (
    <div className={cn("relative size-max", className)}>
      {/* Pixel frame (only show if pixel variant) */}
      {isPixel && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 10 }}
        >
          {/* Top section - Row 1 */}
          <div className="absolute top-0 left-[23%] right-[23%] h-[7%] bg-foreground dark:bg-ring"></div>

          {/* Top section - Row 2 */}
          <div className="absolute top-[6.25%] left-[17%] right-[17%] h-[7%] bg-foreground dark:bg-ring"></div>

          {/* Top section - Row 3 */}
          <div className="absolute top-[12.5%] left-[11%] h-[7%] bg-foreground dark:bg-ring w-[20%]"></div>
          <div className="absolute top-[12.5%] right-[11%] h-[7%] bg-foreground dark:bg-ring w-[20%]"></div>

          {/* Top section - Row 4 */}
          <div className="absolute top-[18.75%] left-[5%] w-[20%] h-[7%] bg-foreground dark:bg-ring"></div>
          <div className="absolute top-[18.75%] right-[5%] w-[20%] h-[7%] bg-foreground dark:bg-ring"></div>

          {/* Top section - Row 5 */}
          <div className="absolute top-[25%] left-0 w-[20%] h-[7%] bg-foreground dark:bg-ring"></div>
          <div className="absolute top-[25%] right-0 w-[20%] h-[7%] bg-foreground dark:bg-ring"></div>

          {/* Top section - Rows 6-7 */}
          <div className="absolute top-[31.25%] left-0 w-[13.5%] h-[13%] bg-foreground dark:bg-ring"></div>
          <div className="absolute top-[31.25%] right-0 w-[13.5%] h-[13%] bg-foreground dark:bg-ring"></div>

          {/* Top section - Rows 8-10 */}
          <div className="absolute top-[43.75%] left-0 w-[13.5%] h-[7%] bg-foreground dark:bg-ring"></div>
          <div className="absolute top-[43.75%] right-0 w-[13.5%] h-[7%] bg-foreground dark:bg-ring"></div>

          {/* Bottom section - Rows 8-10 (mirror) */}
          <div className="absolute top-[50%] left-0 w-[13.5%] h-[7%] bg-foreground dark:bg-ring"></div>
          <div className="absolute top-[50%] right-0 w-[13.5%] h-[7%] bg-foreground dark:bg-ring"></div>

          {/* Bottom section - Rows 6-7 (mirror) */}
          <div className="absolute top-[56.25%] left-0 w-[13.5%] h-[13%] bg-foreground dark:bg-ring"></div>
          <div className="absolute top-[56.25%] right-0 w-[13.5%] h-[13%] bg-foreground dark:bg-ring"></div>

          {/* Bottom section - Row 5 (mirror) */}
          <div className="absolute top-[68.75%] left-0 w-[20%] h-[7%] bg-foreground dark:bg-ring"></div>
          <div className="absolute top-[68.75%] right-0 w-[20%] h-[7%] bg-foreground dark:bg-ring"></div>

          {/* Bottom section - Row 4 (mirror) */}
          <div className="absolute top-[75%] left-[5%] w-[20%] h-[7%] bg-foreground dark:bg-ring"></div>
          <div className="absolute top-[75%] right-[5%] w-[20%] h-[7%] bg-foreground dark:bg-ring"></div>

          {/* Bottom section - Row 3 (mirror) */}
          <div className="absolute top-[81.25%] left-[11%] h-[7%] bg-foreground dark:bg-ring w-[20%]"></div>
          <div className="absolute top-[81.25%] right-[11%] h-[7%] bg-foreground dark:bg-ring w-[20%]"></div>

          {/* Bottom section - Row 2 (mirror) */}
          <div className="absolute top-[87.5%] left-[17%] right-[17%] h-[7%] bg-foreground dark:bg-ring"></div>

          {/* Bottom section - Row 1 (mirror) */}
          <div className="absolute bottom-0 left-[23%] right-[23%] h-[7%] bg-foreground dark:bg-ring"></div>
        </div>
      )}

      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative z-0 flex size-10 shrink-0 overflow-hidden text-xs",
          !isPixel && "rounded-none",
          isPixel && "rounded-full",
          font !== "normal" && "retro",
          variant === "retro" && "image-rendering-pixelated",
          overlay != null &&
            "transition-opacity duration-200 ease-out group-hover:opacity-0",
          className
        )}
        {...props}
      />

      {overlay != null && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[5] overflow-hidden opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100",
            isPixel ? "rounded-full" : "rounded-none"
          )}
          aria-hidden
        >
          {overlay}
        </div>
      )}

      {/* Original border styling (only show if not pixel variant) */}
      {!isPixel && (
        <>
          <div className="pointer-events-none absolute top-0 left-0 z-10 h-0.5 w-full bg-foreground dark:bg-ring" />
          <div className="pointer-events-none absolute bottom-0 z-10 h-0.5 w-full bg-foreground dark:bg-ring" />
          <div className="pointer-events-none absolute top-0.5 -left-0.5 z-10 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
          <div className="pointer-events-none absolute bottom-0.5 -left-0.5 z-10 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
          <div className="pointer-events-none absolute top-0.5 -right-0.5 z-10 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
          <div className="pointer-events-none absolute bottom-0.5 -right-0.5 z-10 h-1/2 w-0.5 bg-foreground dark:bg-ring" />
        </>
      )}
    </div>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

interface BitAvatarImageProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  font?: "normal" | "retro";
  variant?: "default" | "retro" | "pixel";
}

const AvatarImage = forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  BitAvatarImageProps
>(({ className, font, ...props }, ref) => {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      data-slot="avatar-image"
      className={cn(
        "aspect-square h-full w-full",
        font === "retro" && "retro",
        className
      )}
      {...props}
    />
  );
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

interface BitAvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  font?: "normal" | "retro";
  variant?: "default" | "retro" | "pixel";
}

const AvatarFallback = forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  BitAvatarFallbackProps
>(({ className, font, variant = "retro", ...props }, ref) => {
  const isPixel = variant === "pixel";
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center bg-muted text-foreground",
        isPixel ? "rounded-full" : "rounded-none",
        font !== "normal" && "retro",
        variant === "retro" && "image-rendering-pixelated",
        className
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
