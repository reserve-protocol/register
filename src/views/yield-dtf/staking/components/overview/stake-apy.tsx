import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { estimatedApyAtom } from 'state/atoms'
import { formatPercentage } from 'utils'

const StakeApy = () => {
  const { stakers } = useAtomValue(estimatedApyAtom)

  return (
    <div className="my-4 rounded-3xl border border-border p-6">
      <div className="mb-3 flex items-center text-xl font-semibold">
        <span>
          <Trans>Est. Staking Yield:</Trans>
        </span>{' '}
        <span data-testid="staking-apy" className="ml-1 text-primary">
          {formatPercentage(stakers || 0)}
        </span>
      </div>
      <p className="text-xs text-legend">
        <Trans>
          Manually estimated APY calculated from basket averaged yield.
        </Trans>{' '}
        <br />
        <span className="font-medium">
          <Trans>Calculation:</Trans>
        </span>{' '}
        (avgCollateralYield * rTokenMarketCap) / rsrStaked
      </p>
    </div>
  )
}

export default StakeApy
