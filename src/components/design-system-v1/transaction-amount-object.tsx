import { ArrowDown, ArrowUpDown } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'

import { IconButton } from '@/components/icon-button'
import { v1Typography } from '@/components/design-system-v1/typography'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'

interface TransactionAmountObjectBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  label: string
  amount: string
  amountPlaceholder?: string
  asset?: ReactNode
  unit?: ReactNode
  supporting: ReactNode
  supportingRowClassName?: string
  balance?: ReactNode
  balanceAction?: ReactNode
  trailingAction?: ReactNode
  presentation?: 'standalone' | 'input' | 'output'
  tone?: 'default' | 'inverse'
}

export type TransactionAmountObjectProps = TransactionAmountObjectBaseProps &
  (
    | { readOnly: true; disabled?: never; onAmountChange?: never }
    | {
        readOnly?: false
        disabled?: boolean
        onAmountChange: (value: string) => void
      }
  )

export const TransactionAmountPair = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    data-testid="transaction-amount-pair"
    className={cn('relative flex flex-col', className)}
    {...props}
  />
)

export const TransactionAmountRelation = ({
  className,
}: {
  className?: string
}) => (
  <div
    aria-hidden="true"
    data-testid="transaction-amount-relation-divider"
    className={cn('relative z-10 h-px shrink-0 bg-border', className)}
  >
    <span
      data-testid="transaction-amount-relation-indicator"
      className="absolute left-1/2 top-1/2 z-20 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card text-foreground ring-4 ring-card"
    >
      <ArrowDown className="size-4" strokeWidth={1.5} />
    </span>
  </div>
)

export const TransactionAmountDirectionControl = ({
  disabled = false,
  label,
  onClick,
}: {
  disabled?: boolean
  label: string
  onClick: () => void
}) => (
  <div className="relative z-10 h-px shrink-0">
    <IconButton
      label={label}
      icon={<ArrowUpDown />}
      size="compact"
      disabled={disabled}
      onClick={onClick}
      className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 ring-2 ring-card"
    />
  </div>
)

export const TransactionAmountObject = ({
  amount,
  amountPlaceholder,
  asset,
  balance,
  balanceAction,
  className,
  disabled = false,
  label,
  onAmountChange,
  presentation = 'standalone',
  readOnly = false,
  supporting,
  supportingRowClassName,
  tone = 'default',
  trailingAction,
  unit,
  ...props
}: TransactionAmountObjectProps) => (
  <div
    data-testid="transaction-amount-object"
    data-tone={tone}
    className={cn(
      'rounded-lg p-4 transition-colors duration-120',
      tone === 'default' &&
        presentation === 'standalone' &&
        'border border-input bg-card',
      tone === 'default' &&
        presentation === 'input' &&
        (readOnly ? roles.surface.content : roles.surface.neutralControl),
      tone === 'default' && presentation === 'output' && roles.surface.content,
      !readOnly &&
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card',
      className
    )}
    {...props}
  >
    <div className="flex min-w-0 items-center">
      <p
        className={cn(
          v1Typography.body,
          tone === 'inverse' && 'text-primary-foreground',
          presentation === 'input' && !readOnly && 'text-primary'
        )}
      >
        {label}
      </p>
    </div>
    <div
      data-testid="transaction-amount-primary-row"
      className="mt-0.5 flex min-h-10 min-w-0 items-center gap-2 min-[360px]:gap-3"
    >
      {readOnly ? (
        <p
          className={cn(
            'min-w-0 flex-1 truncate text-[22px] font-light leading-7 tabular-nums min-[360px]:text-[28px] min-[360px]:leading-8 sm:text-[32px] sm:leading-[38px]',
            tone === 'inverse'
              ? 'text-primary-foreground'
              : presentation === 'input' && !readOnly
                ? 'text-primary'
                : 'text-foreground'
          )}
        >
          {amount}
          {unit && (
            <span
              data-testid="transaction-amount-unit"
              className={cn(
                'ml-1.5 text-xl min-[360px]:ml-2 min-[360px]:[font-size:inherit] min-[360px]:[line-height:inherit]',
                tone === 'inverse'
                  ? 'text-brand-foreground/70'
                  : roles.text.supporting
              )}
            >
              {unit}
            </span>
          )}
        </p>
      ) : (
        <input
          aria-label={`${label} amount`}
          className={cn(
            'min-w-0 flex-1 bg-transparent text-[22px] font-light leading-7 tabular-nums outline-none min-[360px]:text-[28px] min-[360px]:leading-8 sm:text-[32px] sm:leading-[38px]',
            amountPlaceholder &&
              tone === 'default' &&
              presentation === 'input' &&
              'placeholder:text-primary/70',
            tone === 'inverse'
              ? 'text-primary-foreground'
              : presentation === 'input'
                ? 'text-primary'
                : 'text-foreground'
          )}
          inputMode="decimal"
          placeholder={amountPlaceholder}
          disabled={disabled}
          value={amount}
          onChange={(event) => onAmountChange?.(event.currentTarget.value)}
        />
      )}
      {asset && (
        <div
          className={cn(
            'shrink-0',
            tone === 'inverse' &&
              '[&_[data-testid=transaction-amount-asset-identity]]:text-primary-foreground'
          )}
        >
          {asset}
        </div>
      )}
      {trailingAction && <div className="shrink-0">{trailingAction}</div>}
    </div>
    <div
      data-testid="transaction-amount-supporting-row"
      className={cn(
        'mt-1 flex min-h-5 min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1',
        v1Typography.supporting,
        tone === 'inverse' ? 'text-primary-foreground' : roles.text.supporting,
        supportingRowClassName
      )}
    >
      <span className="min-w-0">{supporting}</span>
      {(balance || (!readOnly && balanceAction)) && (
        <span className="ml-auto flex min-w-0 items-center gap-2">
          {balance && <span className="truncate text-right">{balance}</span>}
          {!readOnly && balanceAction}
        </span>
      )}
    </div>
  </div>
)
