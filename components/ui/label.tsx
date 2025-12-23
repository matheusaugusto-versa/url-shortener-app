import React from "react"

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-medium text-neutral-900 dark:text-neutral-50 ${className || ''}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
    </label>
  )
)
Label.displayName = "Label"

export { Label }
