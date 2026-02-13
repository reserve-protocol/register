import CollateralPieChartWrapper from '@/views/yield-dtf/overview/components/collateral-pie-chart-wrapper'
import RTokenAddresses from '@/views/yield-dtf/overview/components/rtoken-addresses'
import { trackClick } from '@/hooks/useTrackPage'
import { ChainId } from '@/utils/chains'
import Help from '@/components/ui/help'
import ChainLogo from 'components/icons/ChainLogo'
import ChevronRight from 'components/icons/ChevronRight'
import TokenLogo from 'components/icons/TokenLogo'
import { ListedToken } from 'hooks/useTokenList'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTokenRoute } from 'utils'
import { CHAIN_TAGS, ROUTES } from 'utils/constants'
import usePriceETH from '../hooks/usePriceETH'
import EarnButton from './EarnButton'
import MobileCollateralInfo from './MobileCollateralInfo'
import TokenHeader from './TokenHeader'
import TokenStats from './TokenStats'
import TokenActions from './TokenActions'

interface Props {
  token: ListedToken
}

const ChainBadge = ({ chain }: { chain: number }) => (
  <div
    className={`hidden md:flex items-center rounded-[50px] px-2 py-1 gap-1 ${
      chain === ChainId.Arbitrum
        ? 'bg-[rgba(255,171,0,0.06)] border border-[rgba(255,171,0,0.20)]'
        : 'bg-[rgba(0,82,255,0.06)] border border-[rgba(0,82,255,0.20)]'
    }`}
  >
    <ChainLogo chain={chain} fontSize={12} />
    <span
      className={`text-xs ${chain === ChainId.Arbitrum ? 'text-[#FFAB00]' : 'text-primary'}`}
    >
      {CHAIN_TAGS[chain] + ' Native'}
    </span>
    {chain === ChainId.Arbitrum && (
      <Help
        content={
          'Due to low usage, the Reserve DApp is discontinuing mints on Arbitrum. You can still redeem your tokens at any time, as they remain fully backed by their underlying assets.'
        }
      />
    )}
  </div>
)

// TODO: Component should be splitted
const RTokenCard = ({ token }: Props) => {
  const navigate = useNavigate()
  const { priceETHTerms, supplyETHTerms } = usePriceETH(token)

  const handleNavigate = (route: string) => {
    navigate(getTokenRoute(token.id, token.chain, route))
  }

  return (
    <div
      className="bg-card rounded-[20px] border-b-2 border-transparent hover:md:border-primary min-h-full md:min-h-[316px] cursor-pointer transition-[border-color] duration-300 ease-in-out p-0 md:p-3"
      onClick={(e) => {
        e.stopPropagation()
        trackClick(
          'discover',
          'select_dtf',
          token.id,
          token.symbol,
          token.chain
        )
        handleNavigate(ROUTES.OVERVIEW)
      }}
    >
      <div className="flex items-center h-full">
        <div className="hidden md:block pr-4 shrink-0 border-r border-border">
          <CollateralPieChartWrapper token={token} />
        </div>

        <div className="flex flex-col grow items-start justify-start md:justify-between gap-2 h-full min-h-[284px] pl-4 md:pl-8 pr-4 py-4">
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="flex items-center gap-2">
              <TokenLogo
                width={32}
                src={token.logo}
                className="block md:hidden h-8"
              />
              <ChainBadge chain={token.chain} />
              <div className="block md:hidden">
                <ChainLogo chain={token.chain} fontSize={12} />
              </div>
            </div>
            <RTokenAddresses token={token} />
          </div>

          <div className="flex flex-col items-start gap-2 md:gap-6 w-full">
            <div className="flex items-center gap-3 justify-between md:justify-start grow w-full">
              <TokenHeader token={token} priceETHTerms={priceETHTerms} />
              <div className="block md:hidden">
                <ChevronRight width={16} height={16} />
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-col gap-4 md:gap-6 w-full">
              <div className="flex items-center gap-2 md:gap-4 w-full">
                <TokenStats token={token} supplyETHTerms={supplyETHTerms} />
                <EarnButton
                  token={token}
                  className="flex md:hidden grow"
                />
              </div>
              <TokenActions token={token} onNavigate={handleNavigate} />
            </div>
          </div>
          <MobileCollateralInfo token={token} />
        </div>
      </div>
    </div>
  )
}

export default memo(RTokenCard)
