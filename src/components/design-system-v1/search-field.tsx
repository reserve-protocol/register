import { LoaderCircle, Search, X } from 'lucide-react'
import { forwardRef, type MutableRefObject, type Ref, useRef } from 'react'

import { IconButton } from '@/components/icon-button'
import {
  TextInput,
  type TextInputProps,
} from '@/components/design-system-v1/field'
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
