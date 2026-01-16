import { t } from '@lingui/macro'
import StRSR from 'abis/StRSR'
import SpinnerIcon from 'components/icons/SpinnerIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { rTokenStateAtom, rsrPriceAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import {
  pendingRSRSummaryAtom,
  unstakeDelayAtom,
} from '@/views/yield-dtf/staking/atoms'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const Header = () => {
  const delay = useAtomValue(unstakeDelayAtom)

  return (
    <div className="flex items-center border-b border-secondary pb-3">
      <SpinnerIcon />
      <span className="ml-2 font-semibold">RSR in {delay} Cooldown</span>
    </div>
  )
}

const AvailableBalance = () => {
  const { pendingAmount } = useAtomValue(pendingRSRSummaryAtom)
  const price = useAtomValue(rsrPriceAtom)

  return (
    <div className="flex items-center mt-3 mr-auto">
      <TokenLogo symbol="rsr" />
      <div className="ml-3">
        <span className="font-semibold">{formatCurrency(pendingAmount)} RSR</span>
        <span className="text-legend text-xs block">
          ${formatCurrency(pendingAmount * price)}
        </span>
      </div>
    </div>
  )
}

const ConfirmWithdraw = () => {
  const rToken = useRToken()
  const { index, pendingAmount } = useAtomValue(pendingRSRSummaryAtom)
  const { frozen } = useAtomValue(rTokenStateAtom)
  const { isLoading, write, isReady, hash } = useContractWrite(
    rToken?.stToken && pendingAmount && !frozen
      ? {
          address: rToken?.stToken?.address,
          abi: StRSR,
          functionName: 'cancelUnstake',
          args: [index + 1n],
        }
      : undefined
  )
  const { isMining } = useWatchTransaction({ hash, label: 'Cancel unstake' })

  return (
    <Button
      size="sm"
      variant="destructive"
      className="mt-3"
      onClick={write}
      disabled={!isReady || isLoading || isMining}
    >
      {isLoading || isMining ? 'Processing...' : t`Cancel unstake`}
    </Button>
  )
}

interface CooldownUnstakeProps {
  className?: string
}

const CooldownUnstake = ({ className }: CooldownUnstakeProps) => {
  const { pendingAmount } = useAtomValue(pendingRSRSummaryAtom)

  return (
    <div className={cn('rounded-3xl border border-border p-6', className)}>
      <Header />
      {!pendingAmount ? (
        <span className="mt-3 block text-legend">No RSR in cooldown</span>
      ) : (
        <div className="flex items-center">
          <AvailableBalance />
          <ConfirmWithdraw />
        </div>
      )}
    </div>
  )
}

export default CooldownUnstake
