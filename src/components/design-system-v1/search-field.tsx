import { LoaderCircle, Search, X } from 'lucide-react'
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MutableRefObject,
  type ReactNode,
  type Ref,
  useRef,
} from 'react'

import { IconButton } from '@/components/icon-button'
import {
  TextInput,
  textInputRecipe,
  type TextInputProps,
} from '@/components/design-system-v1/field'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'

export interface SearchFieldProps extends Omit<
  TextInputProps,
  'leading' | 'trailing' | 'type'
> {
  clearLabel?: string
  loading?: boolean
  onClear?: () => void
}

const assignRef = <T,>(ref: Ref<T> | undefined, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value)
    return
  }

  if (ref) (ref as MutableRefObject<T | null>).current = value
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  (
    {
      clearLabel = 'Clear search',
      className,
      disabled = false,
      inputClassName,
      loading = false,
      onClear,
      value,
      ...props
    },
    forwardedRef
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const hasValue = value !== undefined && String(value).length > 0
    const showClear = hasValue && Boolean(onClear) && !disabled && !loading

    const trailing = loading ? (
      <LoaderCircle
        aria-hidden="true"
        className="size-4 animate-spin motion-reduce:animate-none"
        strokeWidth={1.5}
      />
    ) : showClear ? (
      <IconButton
        label={clearLabel}
        icon={<X />}
        size="micro"
        tone="quiet"
        className="-mr-2.5"
        onClick={() => {
          onClear?.()
          inputRef.current?.focus()
        }}
      />
    ) : undefined

    return (
      <TextInput
        ref={(node) => {
          inputRef.current = node
          assignRef(forwardedRef, node)
        }}
        type="search"
        value={value}
        disabled={disabled}
        aria-busy={loading || undefined}
        leading={<Search aria-hidden="true" strokeWidth={1.5} />}
        trailing={trailing}
        className={className}
        inputClassName={cn(
          '[&::-webkit-search-cancel-button]:hidden',
          inputClassName
        )}
        {...props}
      />
    )
  }
)

SearchField.displayName = 'SearchField'

export interface SearchFieldLauncherProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
}

/**
 * Search-shaped button for the established application pattern where the real
 * query field and results live in a separate dialog. This preserves truthful
 * button semantics while consuming the SearchField family's visual owner.
 */
export const SearchFieldLauncher = forwardRef<
  HTMLButtonElement,
  SearchFieldLauncherProps
>(({ children = 'Search', className, type = 'button', ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    aria-haspopup="dialog"
    data-testid="canonical-search-field-launcher"
    className={cn(
      textInputRecipe.frame,
      'cursor-pointer pl-[18px] pr-5 text-left hover:bg-muted',
      className
    )}
    {...props}
  >
    <span className={cn(textInputRecipe.leading, roles.text.supporting)}>
      <Search aria-hidden="true" strokeWidth={1.5} />
    </span>
    <span
      className={cn(
        textInputRecipe.text,
        'truncate text-left text-muted-foreground'
      )}
    >
      {children}
    </span>
  </button>
))

SearchFieldLauncher.displayName = 'SearchFieldLauncher'
