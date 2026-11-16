import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { estimatedApyAtom } from 'state/atoms'
import { formatPercentage } from 'utils'
import StakingApyCalculation from './staking-apy-calculation'

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
      <StakingApyCalculation />
    </div>
  )
}

export default StakeApy
