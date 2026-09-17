import { Trans, useLingui } from '@lingui/react/macro'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/design-system-v1/accordion'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/design-system-v1/collapsible'
import {
  DocumentationSpecimenCell,
  DocumentationSpecimenGrid,
} from './documentation-specimen-layout'

export const DisclosureComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()

  if (itemId === 'accordion') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Resting</Trans>}>
          <Accordion type="single" collapsible className="w-full max-w-xl">
            <AccordionItem value="staking">
              <AccordionTrigger>
                <Trans>What is staking?</Trans>
              </AccordionTrigger>
              <AccordionContent>
                <Trans>
                  Staking supplies first-loss capital and governance
                  participation.
                </Trans>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Expanded</Trans>}>
          <Accordion
            type="single"
            collapsible
            defaultValue="voting"
            className="w-full max-w-xl"
          >
            <AccordionItem value="voting">
              <AccordionTrigger>
                <Trans>How does voting work?</Trans>
              </AccordionTrigger>
              <AccordionContent>
                <Trans>
                  Voting power follows the accepted governance mechanics.
                </Trans>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  if (itemId === 'collapsible') {
    return (
      <DocumentationSpecimenGrid className="xl:grid-cols-2">
        <DocumentationSpecimenCell label={<Trans>Resting</Trans>}>
          <Collapsible className="w-full max-w-xl">
            <CollapsibleTrigger
              cue={{ closed: t`Show details`, open: t`Hide details` }}
            >
              <Trans>Advanced settings</Trans>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Trans>
                The owning composition provides the revealed controls.
              </Trans>
            </CollapsibleContent>
          </Collapsible>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell label={<Trans>Expanded</Trans>}>
          <Collapsible defaultOpen className="w-full max-w-xl">
            <CollapsibleTrigger
              cue={{ closed: t`Show details`, open: t`Hide details` }}
            >
              <Trans>Transaction details</Trans>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Trans>
                The expanded region preserves its surrounding context.
              </Trans>
            </CollapsibleContent>
          </Collapsible>
        </DocumentationSpecimenCell>
      </DocumentationSpecimenGrid>
    )
  }

  return null
}
