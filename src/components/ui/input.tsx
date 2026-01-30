import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startAdornment, endAdornment, ...props }, ref) => {
    if (startAdornment || endAdornment) {
      return (
        <div className="relative flex items-center">
          {startAdornment && (
            <div className="absolute left-3 text-muted-foreground">
              {startAdornment}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              startAdornment && 'pl-9',
              endAdornment && 'pr-9',
              className
            )}
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-3 text-muted-foreground">
              {endAdornment}
            </div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

/**
 * Input spécialisé pour les montants en devise
 */
const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'type' | 'startAdornment'> & {
    currency?: string
  }
>(({ className, currency = '$', ...props }, ref) => {
  return (
    <Input
      type="number"
      startAdornment={<span className="text-sm font-medium">{currency}</span>}
      className={cn('font-tabular text-right', className)}
      ref={ref}
      {...props}
    />
  )
})
CurrencyInput.displayName = 'CurrencyInput'

/**
 * Input spécialisé pour les pourcentages
 */
const PercentInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'type' | 'endAdornment'>
>(({ className, ...props }, ref) => {
  return (
    <Input
      type="number"
      step="0.01"
      endAdornment={<span className="text-sm font-medium">%</span>}
      className={cn('font-tabular text-right', className)}
      ref={ref}
      {...props}
    />
  )
})
PercentInput.displayName = 'PercentInput'

export { Input, CurrencyInput, PercentInput }
