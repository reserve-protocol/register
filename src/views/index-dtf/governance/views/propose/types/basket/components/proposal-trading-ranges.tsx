import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Asterisk } from 'lucide-react'
import { useEffect } from 'react'
import {
  isDeferAvailableAtom,
  stepAtom,
  tradeRangeOptionAtom,
  TradeRangeOption as TradeRangeOptionType,
} from '../atoms'
import ProposalTradesSetup from './proposal-trades-setup'

type TradeRangeOptionProps = {
  title: string
  description: string
  value: TradeRangeOptionType
  disabled?: boolean
  checked: boolean
  onClick: () => void
}

const TradeRangeOption = ({
  title,
  description,
  value,
  disabled,
  checked,
  onClick,
}: TradeRangeOptionProps) => (
  <div
    role="button"
    className={cn(
      'flex items-center gap-2 border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:bg-border',
      checked && 'bg-border',
      disabled && 'opacity-50 hover:bg-transparent'
    )}
    onClick={disabled ? undefined : onClick}
  >
    <div
      className={cn(
        'flex items-center flex-shrink-0 justify-center w-8 h-8 bg-foreground/10 rounded-full',
        checked && 'bg-primary/10 text-primary'
      )}
    >
      <Asterisk size={24} strokeWidth={1.5} />
    </div>
    <div className="mr-auto">
      <h4 className={cn('font-bold mb-1 text-base', checked && 'text-primary')}>
        {title}
      </h4>
      <p className="text-sm text-legend">{description}</p>
    </div>
    <Checkbox checked={checked} />
  </div>
)

const NextButton = () => {
  const isValid = !!useAtomValue(tradeRangeOptionAtom)
  const setStep = useSetAtom(stepAtom)

  return (
    <Button
      className="w-full my-2"
      size="lg"
      disabled={!isValid}
      onClick={() => setStep('expiration')}
    >
      Next | Set trade expiration
    </Button>
  )
}

const TradesSetup = () => {
  const option = useAtomValue(tradeRangeOptionAtom)

  if (option !== 'include') return null

  return <ProposalTradesSetup />
}

const ProposalTradingRanges = () => {
  const isDeferAvailable = useAtomValue(isDeferAvailableAtom)
  const [option, setOption] = useAtom(tradeRangeOptionAtom)

  useEffect(() => {
    if (!isDeferAvailable) setOption('include')
  }, [isDeferAvailable])

  return (
    <>
      <p className="text-sm sm:text-base mx-4 sm:mx-6 mb-6">
        Set the new desired percentages and we will calculate the required
        trades needed to adopt the new basket if the proposal passes governance.
      </p>
      <div className="flex flex-col gap-2 mx-2">
        <TradeRangeOption
          title="Defer to price curator"
          description="Explain the benefit of using our framwork & clarify that it doesn't mean."
          value="defer"
          disabled={!isDeferAvailable}
          onClick={() => setOption('defer')}
          checked={option === 'defer'}
        />
        <TradeRangeOption
          title="Include price range(s) in proposal"
          description="Explain the benefit of using our framwork & clarify that it doesn't mean."
          value="include"
          onClick={() => setOption('include')}
          checked={option === 'include'}
        />
        <TradesSetup />
        <NextButton />
      </div>
    </>
  )
}

export default ProposalTradingRanges
