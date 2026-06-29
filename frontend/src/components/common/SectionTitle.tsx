"use client"

import { ReactNode } from "react"

interface SectionTitleProps {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  actions?: ReactNode
  className?: string
}

export function SectionTitle({
  title,
  subtitle,
  icon: Icon,
  actions,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={`mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}