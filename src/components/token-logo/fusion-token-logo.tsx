import TokenLogo from '.'
import ChainLogo from '../icons/ChainLogo'

type FusionTokenType = {
  symbol: string
  chainId: number
  address: string
}

type FusionTokenLogoProps = {
  left: FusionTokenType
  right: FusionTokenType
}

const FusionTokenLogo = ({ left, right }: FusionTokenLogoProps) => {
  return (
    <div className="relative flex-shrink-0">
      <div className="flex items-center gap-[1px]">
        <div className="w-4 h-8 overflow-hidden">
          <div className="w-8 h-8">
            <TokenLogo
              symbol={left.symbol}
              chain={left.chainId}
              address={left.address}
              className="w-8 h-8"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        </div>

        <div className="w-4 h-8 overflow-hidden">
          <div className="w-8 h-8 -ml-4">
            <TokenLogo
              symbol={right.symbol}
              chain={right.chainId}
              address={right.address}
              className="w-8 h-8"
              style={{ clipPath: 'inset(0 0 0 50%)' }}
            />
          </div>
        </div>
      </div>
      <div className="absolute right-0 bottom-0">
        <ChainLogo chain={right.chainId} fontSize={12} />
      </div>
    </div>
  )
}

export default FusionTokenLogo
