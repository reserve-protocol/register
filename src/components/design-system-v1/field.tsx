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
import { v1Typography } from './typography'

export const textInputRecipe = {
  frame:
    'flex h-11 w-full items-center gap-2 rounded-full border border-input bg-card text-foreground transition-colors duration-120 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card',
  leading: 'shrink-0 text-sm [&>svg]:size-4',
  text: 'min-w-0 flex-1 bg-transparent text-base font-light leading-6 outline-none',
} as const

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
  <label className={cn('block', v1Typography.label, className)} {...props} />
)

export const FieldDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(v1Typography.supporting, roles.text.supporting, className)}
    {...props}
  />
)

export const FieldMessage = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(v1Typography.supporting, 'text-destructive', className)}
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
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      className={cn(
        textInputRecipe.frame,
        leading ? 'pl-[18px]' : 'pl-5',
        trailing ? 'pr-[18px]' : 'pr-5',
        disabled && roles.disabled.control,
        readOnly && roles.surface.neutralControl,
        invalid && 'border-destructive',
        className
      )}
    >
      {leading && (
        <span className={cn(textInputRecipe.leading, roles.text.supporting)}>
          {leading}
        </span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid || undefined}
        className={cn(
          textInputRecipe.text,
          'placeholder:text-muted-foreground read-only:cursor-default disabled:cursor-not-allowed',
          inputClassName
        )}
        {...props}
      />
      {trailing && (
        <span
          className={cn('shrink-0 text-base font-light', roles.text.supporting)}
        >
          {trailing}
        </span>
      )}
    </div>
  )
)

TextInput.displayName = 'TextInput'

export const AddressTextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ inputClassName, ...props }, ref) => (
    <TextInput
      ref={ref}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      inputClassName={cn('font-mono text-sm', inputClassName)}
      {...props}
    />
  )
)

AddressTextInput.displayName = 'AddressTextInput'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      disabled = false,
      invalid = false,
      readOnly = false,
      ...props
    },
    ref
  ) => (
    <textarea
      ref={ref}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={invalid || undefined}
      data-testid="canonical-textarea"
      data-readonly={readOnly || undefined}
      className={cn(
        'min-h-32 w-full resize-y rounded-lg border border-input bg-card px-5 py-4 text-base font-light leading-6 text-foreground outline-none transition-colors duration-120 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed',
        disabled && roles.disabled.control,
        readOnly && cn(roles.surface.neutralControl, 'cursor-default'),
        invalid && 'border-destructive',
        className
      )}
      {...props}
    />
  )
)

TextArea.displayName = 'TextArea'
