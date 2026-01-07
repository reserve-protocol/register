import { Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { unstakeDelayAtom } from '../atoms'
import { cn } from '@/lib/utils'

export const UnstakeFlow = () => {
  const delay = useAtomValue(unstakeDelayAtom)

  return (
    <div className="mt-3 flex items-center justify-between text-xs">
      <div>
        <div className="mb-1 h-1 w-3 bg-foreground" />
        <span className="block font-semibold">
          <Trans>Trigger Unstake</Trans>
        </span>
        <span>1 Transaction</span>
      </div>
      <ArrowRight size={16} />
      <div>
        <div className="mb-1 h-1 w-full bg-warning" />
        <span className="block font-semibold text-warning">
          {delay} Delay
        </span>
        <span>Wait entire period</span>
      </div>
      <ArrowRight size={16} />
      <div>
        <div className="mb-1 ml-auto h-1 w-3 bg-foreground" />
        <span className="block font-semibold">
          <Trans>Withdraw RSR</Trans>
        </span>
        <span>1 Transaction</span>
      </div>
    </div>
  )
}

interface UnstakeDelayProps {
  className?: string
}

const UnstakeDelay = ({ className }: UnstakeDelayProps) => {
  const delay = useAtomValue(unstakeDelayAtom)
  const [isOpen, setOpen] = useState(false)

  return (
    <div className={cn('rounded-3xl border border-border p-6', className)}>
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setOpen(!isOpen)}
      >
        <span>
          <Trans>Unstaking delay:</Trans>
        </span>
        <span className="ml-auto mr-3 font-semibold">{delay}</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {isOpen && <UnstakeFlow />}
    </div>
  )
}

export default UnstakeDelay
