import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-ink placeholder:text-muted-foreground/70 selection:bg-brand/40 border-line flex h-10 w-full min-w-0 rounded-[10px] border bg-card px-3.5 py-2 text-sm text-ink transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "hover:border-ink/25 focus-visible:border-action focus-visible:ring-action/20 focus-visible:ring-[3px]",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
