import * as React from "react"
import { cn } from "@/lib/utils"

export type BadgeProps = React.HTMLAttributes<HTMLDivElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}
