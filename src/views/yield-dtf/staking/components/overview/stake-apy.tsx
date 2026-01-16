import { useAtomValue } from 'jotai'
import { estimatedApyAtom } from 'state/atoms'
import { formatPercentage } from 'utils'

const StakeApy = () => {
  const { stakers } = useAtomValue(estimatedApyAtom)

  return (
    <div className="my-4 rounded-3xl border border-border p-6">
      <div className="mb-3 flex items-center text-xl font-semibold">
        <span>Est. Staking Yield:</span>{' '}
        <span className="ml-1 text-primary">
          {formatPercentage(stakers || 0)}
        </span>
      </div>
      <p className="text-xs text-legend">
        Manually estimated APY calculated from basket averaged yield. <br />
        <span className="font-medium">Calculation:</span> (avgCollateralYield *
        rTokenMarketCap) / rsrStaked
      </p>
    </div>
  )
}

export default StakeApy
