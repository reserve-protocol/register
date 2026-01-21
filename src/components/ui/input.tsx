import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { JSX } from 'react'

const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        // default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        default: '',
        outline: 'bg-transparent border-border',
        transparent:
          'ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-0 bg-transparent py-0 px-0 outline-none moz-appearance-none webkit-appearance-none font-normal text-3xl',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  startAdornment?: JSX.Element
  endAdornment?: JSX.Element
}
export interface NumericalInputProps extends Omit<InputProps, 'onChange'> {
  onChange(value: string): void
}

export interface InputWithAdornmentProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: JSX.Element
  endAdornment?: JSX.Element
}

const InputWithAdornment = React.forwardRef<
  HTMLInputElement,
  InputWithAdornmentProps
>(({ startAdornment, endAdornment, className, type, ...props }, ref) => {
  return (
    <div
      className="flex items-center justify-center gap-2 px-3 h-12 rounded-xl border border-input bg-transparent ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 !bg-card"
      data-disabled={props.disabled}
    >
      {startAdornment && (
        <div className={cn('text-muted-foreground')}>{startAdornment}</div>
      )}
      <input
        type={type}
        className={cn(
          'flex h-full w-full rounded-xl bg-transparent py-2 text-sm file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground shadow-none outline-none border-none focus-visible:outline-none focus-visible:border-none focus-visible:shadow-none',
          className
        )}
        ref={ref}
        {...props}
      />
      {endAdornment && (
        <div className={cn('text-muted-foreground')}>{endAdornment}</div>
      )}
    </div>
  )
})
InputWithAdornment.displayName = 'InputWithAdornment'

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant, type, startAdornment, endAdornment, ...props },
    ref
  ) => {
    const hasAdornment = Boolean(startAdornment) || Boolean(endAdornment)

    if (hasAdornment) {
      return (
        <InputWithAdornment
          startAdornment={startAdornment}
          endAdornment={endAdornment}
          className={className}
          type={type}
          {...props}
          ref={ref}
        />
      )
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

const inputRegex = RegExp(`^[0-9]*[.]?[0-9]*$`)

const NumericalInput = React.forwardRef<HTMLInputElement, NumericalInputProps>(
  ({ onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/,/g, '.')
      if (e.target.value === '' || inputRegex.test(input)) {
        onChange(input)
      }
    }

    return (
      <Input
        onChange={handleChange}
        inputMode="decimal"
        autoComplete="off"
        autoCorrect="off"
        type="text"
        pattern="^[0-9]*[.,]?[0-9]*$"
        minLength={1}
        maxLength={79}
        spellCheck="false"
        ref={ref}
        {...props}
      />
    )
  }
)

NumericalInput.displayName = 'Numerical Input'

const SearchInput = React.forwardRef<
  HTMLInputElement,
  InputProps & { inputClassName?: InputProps['className'] }
>(({ className, inputClassName, variant, type, ...props }, ref) => {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="absolute left-6 top-1/2 -translate-y-1/2"
        size={16}
        strokeWidth={1.2}
      />
      <input
        type={type}
        className={cn(
          inputVariants({ variant }),
          inputClassName,
          'pl-14 pr-0 h-16 text-md rounded-2xl bg-card '
        )}
        ref={ref}
        {...props}
      />
    </div>
  )
})

SearchInput.displayName = 'SearchInput'

const InputPostfix = ({
  amount,
  symbol,
}: {
  amount: string
  symbol: string
}) => (
  <div className="-z-10 flex font-semibold text-3xl pt-[2px] absolute top-0 left-0 w-full overflow-hidden">
    <div className="block invisible overflow-hidden">{amount}</div>
    <span className="select-none ml-2">{symbol}</span>
  </div>
)

interface TokenAmountInputProps {
  className?: string
  value: string
  onChange: (value: string) => void
  token: string
}

const TokenAmountInput = ({
  value,
  onChange,
  token,
  className,
}: TokenAmountInputProps) => {
  return (
    <div className={cn('z-0 w-full relative', className)}>
      <NumericalInput
        placeholder={`0 ${token}`}
        variant="transparent"
        style={{ width: `calc(100% - ${token.length * 21}px)` }}
        value={value}
        onChange={onChange}
      />
      {!!value && <InputPostfix amount={value} symbol={token} />}
    </div>
  )
}

export { Input, InputPostfix, NumericalInput, TokenAmountInput, SearchInput }
