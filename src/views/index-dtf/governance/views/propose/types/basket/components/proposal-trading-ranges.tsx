import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Asterisk } from 'lucide-react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { stepAtom, tradeRangeOptionAtom } from '../atoms'
import { cn } from '@/lib/utils'
import ProposalTradesSetup from './proposal-trades-setup'

type TradeRangeOptionProps = {
  title: string
  description: string
  value: 'defer' | 'include'
}

const TradeRangeOption = ({
  title,
  description,
  value,
}: TradeRangeOptionProps) => {
  const [option, setOption] = useAtom(tradeRangeOptionAtom)
  const isChecked = option === value

  return (
    <div
      role="button"
      className={cn(
        'flex items-center gap-2 border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:bg-border',
        isChecked && 'bg-border'
      )}
      onClick={() => setOption(value)}
    >
      <div
        className={cn(
          'flex items-center flex-shrink-0 justify-center w-8 h-8 bg-foreground/10 rounded-full',
          isChecked && 'bg-primary/10 text-primary'
        )}
      >
        <Asterisk size={24} strokeWidth={1.5} />
      </div>
      <div className="mr-auto">
        <h4
          className={cn(
            'font-bold mb-1 text-base',
            isChecked && 'text-primary'
          )}
        >
          {title}
        </h4>
        <p className="text-sm text-legend">{description}</p>
      </div>
      <Checkbox checked={isChecked} />
    </div>
  )
}

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
        />
        <TradeRangeOption
          title="Include price range(s) in proposal"
          description="Explain the benefit of using our framwork & clarify that it doesn't mean."
          value="include"
        />
        <TradesSetup />
        <NextButton />
      </div>
    </>
  )
}

export default ProposalTradingRanges
