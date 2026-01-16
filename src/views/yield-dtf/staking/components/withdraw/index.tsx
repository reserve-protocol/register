import { Trans } from '@lingui/macro'
import { cn } from '@/lib/utils'
import AvailableUnstake from './available-unstake'
import CooldownUnstake from './cooldown-unstake'
import Updater from './updater'

interface WithdrawProps {
  className?: string
}

const Withdraw = ({ className }: WithdrawProps) => {
  return (
    <>
      <div className={cn(className)}>
        <h3 className="ml-4 text-xl font-semibold">
          <Trans>In Withdraw Process</Trans>
        </h3>
        <AvailableUnstake className="mt-3" />
        <CooldownUnstake className="mt-3" />
      </div>
      <Updater />
    </>
  )
}

export default Withdraw
