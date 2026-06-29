"use client"

import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

interface FormSelectProps {
  label?: string
  description?: string
  placeholder?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  showEmptyOption?: boolean
  emptyOptionLabel?: string
}

export function FormSelect({
  label,
  description,
  placeholder = "Seleccionar opción",
  options,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  className = "",
  showEmptyOption = false,
  emptyOptionLabel = "Ninguno",
}: FormSelectProps) {
  const handleValueChange = (newValue: string) => {
    onChange?.(newValue)
    onBlur?.()
  }

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </FormLabel>
      )}
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <FormControl>
          <SelectTrigger className={error ? "border-destructive" : ""}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {showEmptyOption && (
            <SelectItem value="">{emptyOptionLabel}</SelectItem>
          )}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  )
}