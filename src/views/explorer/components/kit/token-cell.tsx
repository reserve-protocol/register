import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { cn } from '@/lib/utils'
import useRTokenLogo from 'hooks/useRTokenLogo'
import InactiveTag from './inactive-tag'

type TokenCellProps = {
  symbol: string
  address?: string
  chain: number
  logo?: string
  size?: number
  className?: string
}

// The network rides on the logo as a badge; the explorer has no network column or chip.
export const TokenCell = ({
  symbol,
  address,
  chain,
  logo,
  size = 30,
  className,
}: TokenCellProps) => (
  <span className={cn('flex min-w-0 items-center gap-3 font-semibold', className)}>
    <TokenLogoWithChain
      symbol={symbol}
      address={address}
      chain={chain}
      src={logo}
      width={size}
      height={size}
    />
    {/* WHY: on mobile the tag drops under the symbol so it does not squeeze the row. */}
    <span className="flex min-w-0 flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
      <span className="max-w-full truncate sm:overflow-visible">{symbol}</span>
      <InactiveTag address={address} />
    </span>
  </span>
)

// For logos the shared resolver does not know (collateral plugins use the legacy symbol map).
export const WithChainBadge = ({
  chain,
  size,
  children,
}: {
  chain: number
  size: number
  children: React.ReactNode
}) => {
  const badge = Math.round((size / 32) * 14)

  return (
    <span className="relative shrink-0">
      {children}
      <span className="absolute -bottom-0.5 -right-1 flex items-center justify-center rounded-md border-2 border-background bg-background">
        <ChainLogo chain={chain} width={badge} height={badge} />
      </span>
    </span>
  )
}

export const YieldTokenCell =(props: Omit<TokenCellProps, 'logo'> & { address: string }) => (
  <TokenCell {...props} logo={useRTokenLogo(props.address, props.chain)} />
)
