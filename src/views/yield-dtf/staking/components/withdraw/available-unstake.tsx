import { Trans, t } from '@lingui/macro'
import StRSR from 'abis/StRSR'
import TokenLogo from 'components/icons/TokenLogo'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { Check } from 'lucide-react'
import {
  rTokenStateAtom,
  rTokenTradingAvailableAtom,
  rsrPriceAtom,
  walletAtom,
} from 'state/atoms'
import { formatCurrency } from 'utils'
import { pendingRSRSummaryAtom } from '@/views/yield-dtf/staking/atoms'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const Header = () => (
  <div className="flex items-center border-b border-secondary pb-3">
    <Check size={20} strokeWidth={1.2} />
    <span className="ml-2 font-semibold">
      <Trans>RSR available to withdraw</Trans>
    </span>
  </div>
)

const AvailableBalance = () => {
  const { availableAmount } = useAtomValue(pendingRSRSummaryAtom)
  const price = useAtomValue(rsrPriceAtom)

  return (
    <div className="flex items-center mt-3 mr-auto">
      <TokenLogo symbol="rsr" />
      <div className="ml-3">
        <span className="font-semibold">{formatCurrency(availableAmount)} RSR</span>
        <span className="text-legend text-xs block">
          ${formatCurrency(availableAmount * price)}
        </span>
      </div>
    </div>
  )
}

const ConfirmWithdraw = () => {
  const rToken = useRToken()
  const { index, availableAmount } = useAtomValue(pendingRSRSummaryAtom)
  const account = useAtomValue(walletAtom)
  const { isCollaterized } = useAtomValue(rTokenStateAtom)
  const isRTokenAvailable = useAtomValue(rTokenTradingAvailableAtom)
  const { write, isReady, isLoading, hash } = useContractWrite(
    rToken?.stToken &&
      isCollaterized &&
      isRTokenAvailable &&
      availableAmount &&
      account
      ? {
          address: rToken.stToken.address,
          abi: StRSR,
          functionName: 'withdraw',
          args: [account, index + 1n],
        }
      : undefined
  )
  const { isMining } = useWatchTransaction({ hash, label: 'Withdraw RSR' })

  return (
    <Button
      size="sm"
      className="mt-3"
      onClick={write}
      disabled={!isReady || isLoading || isMining}
    >
      {isLoading || isMining ? (
        <Trans>Processing...</Trans>
      ) : (
        <Trans>Withdraw</Trans>
      )}
    </Button>
  )
}

interface AvailableUnstakeProps {
  className?: string
}

const AvailableUnstake = ({ className }: AvailableUnstakeProps) => {
  return (
    <div className={cn('rounded-3xl border border-border p-6', className)}>
      <Header />
      <div className="flex items-center">
        <AvailableBalance />
        <ConfirmWithdraw />
      </div>
    </div>
  )
}

export default AvailableUnstake
