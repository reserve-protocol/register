import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const chainLogoSize: Record<Size, number> = {
  sm: 10,
  md: 10,
  lg: 12,
  xl: 14,
}

const TokenLogoWithChain = ({
  symbol,
  address,
  chain,
  size = 'lg',
}: {
  symbol?: string
  address?: string
  chain: number
  size?: Size
}) => {
  const s = chainLogoSize[size]

  return (
    <div className="relative flex-shrink-0">
      <TokenLogo symbol={symbol} address={address} chain={chain} size={size} />
      <ChainLogo
        chain={chain}
        className="absolute -bottom-0.5 -right-0.5"
        width={s}
        height={s}
      />
    </div>
  )
}

export default TokenLogoWithChain
