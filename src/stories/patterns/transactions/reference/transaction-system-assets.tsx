import { ChainBadgedLogo, EntityIdentity } from '@/components/entity-identity'
import TokenLogo from '@/components/token-logo'
import type { ComponentProps } from 'react'

export interface TransactionAssetIdentityProps {
  symbol: string
  chain: number
  name?: string
  supporting?: string
  size?: 'compact' | 'default'
  textRhythm?: 'default' | 'compact-row'
}

export const TransactionAssetIdentity = ({
  chain,
  name,
  size = 'compact',
  supporting,
  symbol,
  textRhythm = 'default',
}: TransactionAssetIdentityProps) => (
  <EntityIdentity
    className={
      textRhythm === 'compact-row'
        ? '[&_[data-slot=entity-identity-name]]:leading-4 [&_[data-slot=entity-identity-supporting]]:leading-4'
        : undefined
    }
    density={size}
    mark={<TransactionAssetMark chain={chain} symbol={symbol} />}
    name={name ?? symbol}
    supporting={supporting}
  />
)

export const TransactionAssetMark = ({
  chain,
  symbol,
}: {
  chain: number
  symbol: string
}) => (
  <ChainBadgedLogo
    aria-hidden="true"
    alt=""
    chain={chain}
    symbol={symbol}
    src={ASSET_LOGOS[symbol] ?? '/svgs/defaultLogo.svg'}
    size="lg"
  />
)

export const TransactionAmountAsset = ({
  chain,
  symbol,
}: {
  chain: number
  symbol: string
}) => (
  <span
    data-testid="transaction-amount-asset-identity"
    className="flex items-center gap-1.5 text-lg font-light leading-7 text-foreground min-[360px]:gap-2 min-[360px]:text-xl"
  >
    <TransactionAssetMark chain={chain} symbol={symbol} />
    <span>{symbol}</span>
  </span>
)

export const TransactionAssetLogo = ({
  className,
  size = 'sm',
  symbol,
  ...props
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  symbol: string
} & Omit<ComponentProps<typeof TokenLogo>, 'alt' | 'size' | 'src'>) => (
  <TokenLogo
    aria-hidden="true"
    alt=""
    className={className}
    size={size}
    src={ASSET_LOGOS[symbol] ?? '/svgs/defaultLogo.svg'}
    symbol={symbol}
    {...props}
  />
)

const ASSET_LOGOS: Record<string, string> = {
  CMC20: '/imgs/cmc20.png',
  ETH: '/svgs/eth.svg',
  RSR: '/svgs/rsr.svg',
  vlRSR: '/svgs/rsr.svg',
  stRSR: '/svgs/strsr.svg',
  USDC: '/svgs/usdc.svg',
  USDT: '/svgs/usdt.svg',
  WBTC: '/svgs/wbtc.svg',
  WETH: '/svgs/weth.svg',
  WBNB: '/imgs/bnb.png',
  AAVE: '/svgs/aave.svg',
}
