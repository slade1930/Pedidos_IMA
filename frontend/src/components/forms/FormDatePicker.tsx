"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface FormDatePickerProps {
  label?: string
  description?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  value?: Date | null
  onChange?: (date: Date | null) => void
  onBlur?: () => void
  error?: string
  fromDate?: Date
  toDate?: Date
  showTimePicker?: boolean
}

export function FormDatePicker({
  label,
  description,
  placeholder = "Seleccionar fecha",
  disabled = false,
  required = false,
  value,
  onChange,
  onBlur,
  error,
  fromDate,
  toDate,
  showTimePicker = false,
}: FormDatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date ?? null)

    if (date && !showTimePicker) {
      setOpen(false)
    }

    onBlur?.()
  }

  const formattedDate = value
    ? format(value, "PPP", { locale: es })
    : ""

  return (
    <FormItem className="space-y-2">
      {label && (
        <FormLabel>
          {label}
          {required && (
            <span className="ml-1 text-destructive">
              *
            </span>
          )}
        </FormLabel>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                error && "border-destructive"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />

              {formattedDate || placeholder}
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={handleSelect}
            locale={es}
            disabled={(date) => {
              if (disabled) return true

              if (fromDate && date < fromDate) {
                return true
              }

              if (toDate && date > toDate) {
                return true
              }

              return false
            }}
          />

          {showTimePicker && value && (
            <div className="border-t p-3">
              <div className="flex items-center justify-center gap-2">
                <input
                  type="time"
                  value={format(value, "HH:mm")}
                  onChange={(e) => {
                    const [hours, minutes] =
                      e.target.value.split(":")

                    const newDate = new Date(value)

                    newDate.setHours(
                      Number(hours)
                    )

                    newDate.setMinutes(
                      Number(minutes)
                    )

                    onChange?.(newDate)
                  }}
                  className="rounded-md border px-2 py-1 text-sm"
                />
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {description && (
        <FormDescription>
          {description}
        </FormDescription>
      )}

      {error && (
        <FormMessage>
          {error}
        </FormMessage>
      )}
    </FormItem>
  )
}