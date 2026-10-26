import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,border-color,color,box-shadow] cursor-pointer disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-action/35 focus-visible:ring-[3px] aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Ink: the main dark button
        default:
          "bg-ink text-white hover:bg-ink/88",
        // Action blue: the one primary call to action of a screen
        action:
          "bg-action text-white hover:bg-action/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/25",
        outline:
          "border border-line bg-card text-ink hover:border-ink/30 hover:bg-soft",
        secondary:
          "bg-cream text-ink hover:bg-ink/[0.07]",
        ghost:
          "text-ink hover:bg-ink/[0.06]",
        link: "text-action underline-offset-4 hover:underline rounded-sm",
      },
      size: {
        default: "h-10 px-5 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 px-3.5 text-[13px] has-[>svg]:px-3",
        lg: "h-12 px-7 text-[15px] has-[>svg]:px-6",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
