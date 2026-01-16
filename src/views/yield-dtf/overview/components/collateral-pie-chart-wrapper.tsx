import { cn } from '@/lib/utils'
import { MouseoverTooltipContent } from '@/components/old/tooltip'
import { t } from '@lingui/macro'
import ChevronRight from 'components/icons/ChevronRight'
import CircleIcon from 'components/icons/CircleIcon'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import HelpIcon from 'components/icons/CustomHelpIcon'
import { ListedToken } from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { FC, memo, useMemo, useState } from 'react'
import { collateralsMetadataAtom } from 'state/cms/atoms'
import { stringToColor } from 'utils'
import CollateralPieChart from './collateral-pie-chart'
import CollateralPieChartTooltip from './collateral-pie-chart-tooltip'

type Props = {
  token: ListedToken
}

const CollateralPieChartWrapper: FC<Props> = ({ token }) => {
  const [isHovered, setIsHovered] = useState(false)
  const metadata = useAtomValue(collateralsMetadataAtom)

  const chartData = useMemo(
    () =>
      token.collaterals.map((c) => {
        const cmsCollateral =
          metadata?.[c.symbol.toLowerCase().replace('-vault', '')]
        return {
          name: c.symbol,
          value:
            +(token.collateralDistribution[c.id.toLowerCase()]?.dist ?? 0) *
            100,
          color: cmsCollateral?.color || stringToColor(c.id),
          project: cmsCollateral?.protocol?.name || 'GENERIC',
          projectColor: cmsCollateral?.protocol?.color || 'gray',
        }
      }),
    []
  )

  return (
    <MouseoverTooltipContent
      content={<CollateralPieChartTooltip token={token} />}
    >
      <div
        className="p-2 transition-all duration-300 hover:rounded-[10px] hover:bg-card hover:cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CollateralPieChart
          data={chartData}
          logo={token.logo}
          staked={+token.overcollaterization.toFixed(2).toString()}
          topInformation={
            <div className="relative w-full">
              {/* To preserve space */}
              <div className="invisible h-8" />
              <button
                className="rounded-md w-full py-2 px-2 bg-input opacity-0 transition-opacity duration-300 absolute top-0 left-0 z-[1] hover:bg-[#F9F9F9]"
                type="button"
              >
                <div className="flex items-center text-foreground justify-between">
                  <div className="flex items-center gap-1">
                    <CircleIcon />
                    <span className="text-sm leading-4 font-bold">
                      {t`Full exposure view`}
                    </span>
                  </div>
                  <ChevronRight />
                </div>
              </button>
              <div
                className={cn(
                  'p-2 flex items-center justify-between w-full absolute opacity-100 transition-opacity duration-300 top-0 left-0 gap-2 rounded-md',
                  !token.isCollaterized && 'bg-borderSecondary'
                )}
              >
                <div className="flex items-center gap-1">
                  <CircleIcon color="currentColor" />
                  {token.isCollaterized ? (
                    <span className="text-sm">{t`Backing`}</span>
                  ) : (
                    <span className="text-sm font-bold">Rebalancing</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {token.isCollaterized && (
                    <span className="text-sm font-bold">
                      {token.backing.toFixed(0)}%
                    </span>
                  )}
                  <ChevronRight color="currentColor" />
                </div>
              </div>
            </div>
          }
          bottomInformation={
            <div className="p-2 flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                <CollaterizationIcon />
                <span className="text-sm">{t`Staked RSR`}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">
                  {token.overcollaterization.toFixed(0)}%
                </span>
                <HelpIcon color="#999999" />
              </div>
            </div>
          }
          isRebalancing={!token.isCollaterized}
        />
      </div>
    </MouseoverTooltipContent>
  )
}

export default memo(CollateralPieChartWrapper)
