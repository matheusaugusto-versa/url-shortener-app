import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', ariaLabel, disabled, ...props }, ref) => {
    const baseStyles = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed'

    const variantStyles = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600',
      outline: 'border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:ring-neutral-500',
      ghost: 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:ring-neutral-500',
      destructive: 'bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600',
    }

    const sizeStyles = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled}
        aria-label={ariaLabel}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
