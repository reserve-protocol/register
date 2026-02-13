import { Trans } from '@lingui/macro'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import { ListedToken } from 'hooks/useTokenList'
import { memo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import CollateralPieChartTooltip from '@/views/yield-dtf/overview/components/collateral-pie-chart-tooltip'

interface Props {
  token: ListedToken
}

const MobileCollateralInfo = ({ token }: Props) => {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="flex flex-col gap-2 items-start justify-start md:hidden w-full">
      <hr className="border-border w-full my-4" />
      <div
        className="flex md:hidden items-center gap-2 justify-between w-full"
        onClick={(e) => {
          e.stopPropagation()
          setCollapsed((c) => !c)
        }}
      >
        <div className="flex items-center gap-2">
          <CollaterizationIcon />
          <span className="text-legend">
            <Trans>Backing + Overcollaterization:</Trans>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold">
            {(token.backing + token.overcollaterization).toFixed(0)}%
          </span>
          {collapsed ? (
            <ChevronDown size={16} color="#808080" />
          ) : (
            <ChevronUp size={16} color="#808080" />
          )}
        </div>
      </div>
      <div
        className="overflow-hidden transition-[max-height] duration-[400ms] ease-in-out"
        style={{ maxHeight: collapsed ? '0px' : '1000px' }}
      >
        <div className="flex md:hidden flex-col gap-2 w-full">
          <hr className="border-border w-full" />
          <CollateralPieChartTooltip token={token} />
        </div>
      </div>
    </div>
  )
}

export default memo(MobileCollateralInfo)
