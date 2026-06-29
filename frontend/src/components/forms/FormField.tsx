"use client"

import { ReactNode } from "react"
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label?: string
  description?: string
  placeholder?: string
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "textarea"
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  icon?: ReactNode
  autoComplete?: string
  rows?: number
  min?: number
  max?: number
  step?: number
}

export function FormField({
  label,
  description,
  placeholder,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  className = "",
  icon,
  autoComplete,
  rows = 3,
  min,
  max,
  step,
}: FormFieldProps) {
  const isTextarea = type === "textarea"

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </FormLabel>
      )}
      <FormControl>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          {isTextarea ? (
            <Textarea
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              rows={rows}
              className={cn(error && "border-destructive", icon && "pl-10")}
            />
          ) : (
            <Input
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              autoComplete={autoComplete}
              min={min}
              max={max}
              step={step}
              className={cn(error && "border-destructive", icon && "pl-10")}
            />
          )}
        </div>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  )
}