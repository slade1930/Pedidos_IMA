"use client"

import { Search, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  onSearch?: (search: string) => void
  onFilterChange?: (key: string, value: string) => void
  filters?: {
    key: string
    label: string
    options: FilterOption[]
    placeholder?: string
  }[]
  showReset?: boolean
  onReset?: () => void
  searchPlaceholder?: string
  isLoading?: boolean
}

export function FilterBar({
  onSearch,
  onFilterChange,
  filters = [],
  showReset = true,
  onReset,
  searchPlaceholder = "Buscar...",
  isLoading = false,
}: FilterBarProps) {
  const [searchValue, setSearchValue] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const handleSearch = () => {
    onSearch?.(searchValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    onFilterChange?.(key, value)
  }

  const handleReset = () => {
    setSearchValue("")
    setActiveFilters({})
    onSearch?.("")
    onReset?.()
  }

  const hasActiveFilters = searchValue !== "" || Object.keys(activeFilters).length > 0

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-9"
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          Buscar
        </Button>
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={activeFilters[filter.key] || "all"}
          onValueChange={(value) =>
            handleFilterChange(filter.key, value === "all" ? "" : value)
          }
          disabled={isLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={filter.placeholder || filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {showReset && hasActiveFilters && (
        <Button variant="ghost" onClick={handleReset} disabled={isLoading}>
          <X className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}