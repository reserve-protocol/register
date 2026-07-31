import { AnimatedNumber } from '@/components/ui/animated-number'
import { formatCurrency } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { stTokenAtom } from '../atoms'
import { useVoteLockExchangeRate } from '../hooks/use-vote-lock-exchange-rate'

// Renders for every vault (1:1 legacy vaults show rate 1) and without a
// connected wallet.
const VaultExchangeRate = () => {
  const stToken = useAtomValue(stTokenAtom)
  const { rate } = useVoteLockExchangeRate(
    stToken
      ? {
          stToken: stToken.id,
          chainId: stToken.chainId,
          shareDecimals: stToken.token.decimals,
          underlyingDecimals: stToken.underlying.decimals,
        }
      : undefined
  )

  if (!stToken || rate === undefined) return null

  return (
    <div className="flex items-center justify-between px-4 pt-3 text-sm">
      <span className="text-legend">
        <Trans>Exchange rate</Trans>
      </span>
      <span className="font-medium" data-testid="vote-lock-exchange-rate-row">
        1 {stToken.token.symbol} ={' '}
        <AnimatedNumber
          value={rate}
          formatter={(value) => formatCurrency(value, 4)}
        />{' '}
        {stToken.underlying.symbol}
      </span>
    </div>
  )
}

export default VaultExchangeRate
