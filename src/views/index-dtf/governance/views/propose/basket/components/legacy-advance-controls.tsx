import { AccordionContent, AccordionItem } from '@/components/ui/accordion'
import type { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
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

const ADVANCED_CONTROLS: (Omit<ProposalStep, 'title' | 'titleSecondary'> & {
  title: MessageDescriptor
  titleSecondary: MessageDescriptor
})[] = [
  {
    id: 'prices',
    icon: <AlignCenterVertical size={16} strokeWidth={1.5} />,
    title: msg`Price Settings`,
    titleSecondary: msg`Price Settings`,
    content: <ProposalTradingRanges />,
    triggerLabel: <TradeRangeTriggerLabel />,
  },
  {
    id: 'expiration',
    icon: <Sunrise size={16} strokeWidth={1.5} />,
    title: msg`Launch Settings`,
    titleSecondary: msg`Launch Settings`,
    content: <ProposalRebalanceLaunchSettings />,
    triggerLabel: <TradingExpirationTriggerLabel />,
  },
]

// @depreacted - 1.0/2.0 auctions only
const LegacyAdvancedControls = () => {
  const { t } = useLingui()
  const advancedControls = useAtomValue(advancedControlsAtom)

  if (!advancedControls) return null

  return (
    <div>
      <div className="flex justify-center items-center gap-4 py-3 px-3">
        <div className="flex-grow h-[1px] bg-muted-foreground/10" />
        <div className="text-base font-bold">
          <Trans>Advanced Controls</Trans>
        </div>
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
              title={t(title)}
              triggerLabel={triggerLabel}
              advanced
            />
            <AccordionContent className="flex flex-col animate-fade-in">
              <h2 className="text-xl  sm:text-2xl font-bold text-primary mx-4 sm:mx-6 mb-2">
                {t(titleSecondary)}
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
