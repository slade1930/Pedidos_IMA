"use client"

import { AlertCircle, RefreshCw } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  error?: Error | null
}

export function ErrorState({
  title = "Algo salió mal",
  description = "Ocurrió un error al cargar los datos. Por favor, intenta de nuevo.",
  onRetry,
  error,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {description}
          {error && process.env.NODE_ENV === "development" && (
            <pre className="mt-2 text-xs">{error.message}</pre>
          )}
        </AlertDescription>
      </Alert>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Intentar de nuevo
        </Button>
      )}
    </div>
  )
}