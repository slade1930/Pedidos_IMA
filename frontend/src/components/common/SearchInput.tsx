"use client"

import { Search, X } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  debounceMs?: number
  autoFocus?: boolean
  className?: string
  isLoading?: boolean
}

export function SearchInput({
  value: externalValue,
  onChange,
  onSearch,
  placeholder = "Buscar...",
  debounceMs = 300,
  autoFocus = false,
  className = "",
  isLoading = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue || "")

  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue)
    }
  }, [externalValue])

  useEffect(() => {
    if (!onChange || debounceMs === 0) return

    const timeout = setTimeout(() => {
      onChange(internalValue)
    }, debounceMs)

    return () => clearTimeout(timeout)
  }, [internalValue, onChange, debounceMs])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)

    if (onChange && debounceMs === 0) {
      onChange(newValue)
    }
  }

  const handleClear = () => {
    setInternalValue("")
    onChange?.("")
    onSearch?.("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(internalValue)
    }
  }

  const handleSearch = () => {
    onSearch?.(internalValue)
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        className="pl-9 pr-16"
        autoFocus={autoFocus}
        disabled={isLoading}
      />
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
        {internalValue && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleClear}
            disabled={isLoading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {onSearch && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleSearch}
            disabled={isLoading}
          >
            Buscar
          </Button>
        )}
      </div>
    </div>
  )
}