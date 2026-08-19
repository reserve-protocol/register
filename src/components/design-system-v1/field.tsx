import {
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react'

import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

export const Field = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-2', className)} {...props} />
)

export const FieldLabel = ({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn('block text-sm font-medium leading-5', className)}
    {...props}
  />
)

export const FieldDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      'text-sm font-light leading-5',
      roles.text.supporting,
      className
    )}
    {...props}
  />
)

export const FieldMessage = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn('text-sm font-light leading-5 text-destructive', className)}
    {...props}
  />
)

export interface TextInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  leading?: ReactNode
  trailing?: ReactNode
  invalid?: boolean
  inputClassName?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className,
      disabled = false,
      inputClassName,
      invalid = false,
      leading,
      readOnly = false,
      trailing,
      ...props
    },
    ref
  ) => (
    <div
      data-testid="canonical-text-input"
      data-invalid={invalid || undefined}
      className={cn(
        'flex h-11 w-full items-center gap-2 rounded-full border border-input bg-card px-4 text-foreground transition-colors duration-120 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card',
        (disabled || readOnly) && roles.disabled.control,
        invalid && 'border-destructive',
        className
      )}
    >
      {leading && <span className="shrink-0 text-sm">{leading}</span>}
      <input
        ref={ref}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-base font-light leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed',
          inputClassName
        )}
        {...props}
      />
      {trailing && (
        <span className="shrink-0 text-base font-light">{trailing}</span>
      )}
    </div>
  )
)

TextInput.displayName = 'TextInput'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, disabled = false, invalid = false, ...props }, ref) => (
    <textarea
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      data-testid="canonical-textarea"
      className={cn(
        'min-h-32 w-full resize-y rounded-lg border border-input bg-card px-4 py-3 text-base font-light leading-6 text-foreground outline-none transition-colors duration-120 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed',
        disabled && roles.disabled.control,
        invalid && 'border-destructive',
        className
      )}
      {...props}
    />
  )
)

TextArea.displayName = 'TextArea'
