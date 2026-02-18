import { Trans } from '@lingui/macro'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import MoneyIcon from 'components/icons/MoneyIcon'
import PegIcon from 'components/icons/PegIcon'
import { ListedToken } from 'hooks/useTokenList'
import { formatCurrency } from 'utils'
import VerticalDivider from './VerticalDivider'

interface TokenStatsProps {
  token: ListedToken
  supplyETHTerms: number | undefined
}

const TokenStats = ({ token, supplyETHTerms }: TokenStatsProps) => {
  return (
    <div className="flex items-center gap-2 md:gap-4 w-full">
      <div className="flex md:hidden">
        <MoneyIcon />
      </div>
      <div className="flex items-start md:items-center flex-col md:flex-row gap-0 md:gap-2 flex-wrap mr-2 md:mr-0">
        <div className="flex items-center mr-1">
          <div className="hidden md:flex">
            <MoneyIcon />
          </div>
          <span className="text-legend whitespace-nowrap">
            <Trans>Market cap:</Trans>
          </span>
        </div>
        <div className="flex items-start md:items-end flex-col md:flex-row gap-1">
          <span className="font-semibold">
            ${formatCurrency(token.supply, 0)}
          </span>
          {supplyETHTerms && (
            <span className="text-sm">
              {`(${formatCurrency(supplyETHTerms, 0)} ${
                token.targetUnits
              })`}
            </span>
          )}
        </div>
      </div>
      <VerticalDivider className="hidden md:flex" />
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        <PegIcon />
        <span className="text-legend">
          <Trans>Peg:</Trans>
        </span>
        <span className="font-semibold">
          {token?.targetUnits?.split(',').length > 2
            ? `${token?.targetUnits?.split(',').length} targets`
            : token.targetUnits}
        </span>
      </div>
      <VerticalDivider className="hidden lg:flex" />
      <div className="hidden lg:flex items-center gap-2 flex-wrap">
        <CollaterizationIcon />
        <span className="text-legend">
          <Trans>Backing + Overcollaterization:</Trans>
        </span>
        <span className="font-semibold">
          {(token.backing + token.overcollaterization).toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

export default TokenStats
