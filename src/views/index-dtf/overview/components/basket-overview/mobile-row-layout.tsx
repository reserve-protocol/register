import TokenLogo from '@/components/token-logo'

export const MobileTokenLogo = ({
  symbol,
  address,
  chain,
  src,
}: {
  symbol: string
  address?: string
  chain?: number
  src?: string
}) =>
  src ? (
    <TokenLogo size="sm" src={src} />
  ) : (
    <TokenLogo
      size="sm"
      symbol={symbol}
      address={address ?? ''}
      chain={chain}
    />
  )
