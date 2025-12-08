import { rTokenTargetPriceAtom } from '@/views/yield-dtf/overview/atoms'
import { Trans } from '@lingui/macro'
import StakedIcon from 'components/icons/StakedIcon'
import { atom, useAtomValue } from 'jotai'
import { rTokenPriceAtom, rTokenStateAtom, rsrPriceAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import OverviewActions from './overview-actions'

const rTokenOverviewAtom = atom((get) => {
  const state = get(rTokenStateAtom)
  const rTokenPrice = get(rTokenPriceAtom)
  const rsrPrice = get(rsrPriceAtom)
  const pegData = get(rTokenTargetPriceAtom)

  if (!rTokenPrice || !rsrPrice) {
    return null
  }

  return {
    supply: state.tokenSupply * rTokenPrice,
    staked: state.stTokenSupply * rsrPrice,
    pegData,
  }
})

const TokenMetrics = () => {
  const data = useAtomValue(rTokenOverviewAtom)

  return (
    <>
      <span className="block">
        <Trans>Total Market Cap</Trans>
      </span>
      {data?.pegData ? (
        <div className="flex items-center sm:items-end mt-3 flex-wrap">
          <h1 className="text-primary mr-2 text-[32px] sm:text-5xl">
            {formatCurrency(data.pegData.supply, 0)} {data.pegData.unit}
          </h1>
          <span className="block text-xl sm:text-2xl">
            (${formatCurrency(data?.supply ?? 0, 0)})
          </span>
        </div>
      ) : (
        <h1 className="text-primary text-5xl">
          ${formatCurrency(data?.supply ?? 0, 0)}
        </h1>
      )}

      <div className="mb-4 mt-3 flex items-center">
        <StakedIcon />
        <span className="ml-2">
          <Trans>Stake pool USD value:</Trans>
        </span>
        <span className="ml-1 font-medium">
          ${formatCurrency(data?.staked ?? 0, 0)}
        </span>
      </div>
    </>
  )
}

const TokenStats = () => (
  <div>
    <TokenMetrics />
    <OverviewActions />
  </div>
)

export default TokenStats
