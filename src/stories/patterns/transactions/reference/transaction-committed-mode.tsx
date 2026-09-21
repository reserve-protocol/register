import { v1Typography } from '@/components/design-system-v1/typography'

import { TransactionAssetLogo } from './transaction-system-assets'

export const TransactionCommittedMode = ({
  assetSymbol,
  isActive = true,
  label,
}: {
  assetSymbol: string
  isActive?: boolean
  label: string
}) => (
  <div
    data-activity={isActive ? 'active' : 'static'}
    data-asset-symbol={assetSymbol}
    data-testid="transaction-committed-mode"
    className="flex h-8 w-fit shrink-0 items-center gap-2 rounded-full bg-muted p-0.5 pr-3 text-foreground duration-180 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-reduce:transition-none"
  >
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-card shadow-sm">
      <TransactionAssetLogo
        data-testid="transaction-committed-mode-logo"
        symbol={assetSymbol}
        className={
          isActive
            ? 'motion-safe:animate-[spin_12s_linear_infinite] motion-reduce:animate-none'
            : undefined
        }
      />
    </span>
    <span className={v1Typography.label}>{label}</span>
  </div>
)
