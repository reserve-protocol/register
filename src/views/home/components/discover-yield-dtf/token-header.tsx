import TokenLogo from 'components/icons/TokenLogo'
import { ListedToken } from 'hooks/useTokenList'
import { formatCurrency } from 'utils'

interface TokenHeaderProps {
  token: ListedToken
  priceETHTerms: number | undefined
}

const TokenHeader = ({ token, priceETHTerms }: TokenHeaderProps) => {
  return (
    <div className="flex items-center gap-3 justify-between md:justify-start grow w-full">
      <TokenLogo
        width={50}
        src={token.logo}
        className="hidden md:block"
      />
      <div className="flex flex-col items-start">
        <span className="text-[26px] font-bold leading-[26px]">
          {token.symbol}
        </span>
        <span className="text-legend text-base">
          {priceETHTerms
            ? `${priceETHTerms} ${token.targetUnits} ($${formatCurrency(
                token.price,
                3
              )})`
            : `$${formatCurrency(token.price, 3)}`}
        </span>
      </div>
    </div>
  )
}

export default TokenHeader
