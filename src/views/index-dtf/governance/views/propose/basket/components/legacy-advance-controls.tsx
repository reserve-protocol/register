import { AccordionContent, AccordionItem } from '@/components/ui/accordion'
import { useAtomValue } from 'jotai'
import { AlignCenterVertical, Sunrise } from 'lucide-react'
import { advancedControlsAtom } from '../atoms'
import ProposalTradingRanges, {
  TradeRangeTriggerLabel,
} from './proposal-basket-price-settings'
import ProposalRebalanceLaunchSettings, {
  TradingExpirationTriggerLabel,
} from './proposal-rebalance-launch-settings'
import ProposalStepTrigger, { ProposalStep } from './proposal-step-trigger'

const ADVANCED_CONTROLS: ProposalStep[] = [
  {
    id: 'prices',
    icon: <AlignCenterVertical size={16} strokeWidth={1.5} />,
    title: 'Price Settings',
    titleSecondary: 'Price Settings',
    content: <ProposalTradingRanges />,
    triggerLabel: <TradeRangeTriggerLabel />,
  },
  {
    id: 'expiration',
    icon: <Sunrise size={16} strokeWidth={1.5} />,
    title: 'Launch Settings',
    titleSecondary: 'Launch Settings',
    content: <ProposalRebalanceLaunchSettings />,
    triggerLabel: <TradingExpirationTriggerLabel />,
  },
]

// @depreacted - 1.0/2.0 auctions only
const LegacyAdvancedControls = () => {
  const advancedControls = useAtomValue(advancedControlsAtom)

  if (!advancedControls) return null

  return (
    <div>
      <div className="flex justify-center items-center gap-4 py-3 px-3">
        <div className="flex-grow h-[1px] bg-muted-foreground/10" />
        <div className="text-base font-bold">Advanced Controls</div>
        <div className="flex-grow h-[1px] bg-muted-foreground/10" />
      </div>

      {ADVANCED_CONTROLS.map(
        ({ id, icon, title, titleSecondary, content, triggerLabel }) => (
          <AccordionItem
            key={id}
            value={id}
            className="rounded-3xl bg-card m-1 border-none"
          >
            <ProposalStepTrigger
              id={id}
              icon={icon}
              title={title}
              triggerLabel={triggerLabel}
              advanced
            />
            <AccordionContent className="flex flex-col animate-fade-in">
              <h2 className="text-xl  sm:text-2xl font-bold text-primary mx-4 sm:mx-6 mb-2">
                {titleSecondary}
              </h2>
              {content}
            </AccordionContent>
          </AccordionItem>
        )
      )}
    </div>
  )
}

export default LegacyAdvancedControls
