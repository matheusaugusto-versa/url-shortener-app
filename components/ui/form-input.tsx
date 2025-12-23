import { ReactNode } from "react"
import { Label } from "./label"
import { Input } from "./input"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  icon?: ReactNode
  required?: boolean
  description?: string
}

export function FormInput({
  label,
  error,
  helperText,
  icon,
  required,
  description,
  className,
  id,
  ...inputProps
}: FormInputProps) {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" aria-hidden="true">
            {icon}
          </div>
        )}
        <Input
          id={inputId}
          className={`${
            icon ? "pl-10" : ""
          } ${error ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"} ${className || ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...inputProps}
        />
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-sm text-red-500 flex items-center gap-1"
          role="alert"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-neutral-500" id={`${inputId}-helper`}>
          {helperText}
        </p>
      )}

      {description && (
        <p className="text-xs text-neutral-400">
          {description}
        </p>
      )}
    </div>
  )
}
