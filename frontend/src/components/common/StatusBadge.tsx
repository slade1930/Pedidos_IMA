"use client"

import { VariantProps, cva } from "class-variance-authority"
import { ReactNode } from "react"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        primary: "bg-primary/10 text-primary",
        secondary: "bg-secondary/10 text-secondary-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

export interface StatusBadgeProps
  extends VariantProps<typeof statusBadgeVariants> {
  children: ReactNode
  className?: string
  showDot?: boolean
}

export function StatusBadge({
  children,
  variant,
  size,
  className,
  showDot = false,
}: StatusBadgeProps) {
  const dotColors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
    default: "bg-gray-500",
    primary: "bg-primary",
    secondary: "bg-secondary",
  }

  return (
    <div className={statusBadgeVariants({ variant, size, className })}>
      {showDot && (
        <span
          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
            dotColors[variant || "default"]
          }`}
        />
      )}
      {children}
    </div>
  )
}