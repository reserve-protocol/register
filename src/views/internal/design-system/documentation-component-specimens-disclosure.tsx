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
import { DocumentationSpecimenCell } from './documentation-specimen-layout'

export const DisclosureComponentSpecimen = ({ itemId }: { itemId: string }) => {
  const { t } = useLingui()

  if (itemId === 'accordion') {
    return (
      <div className="w-full space-y-8">
        <DocumentationSpecimenCell
          label={<Trans>Multiple · ordinary informational set</Trans>}
        >
          <Accordion
            type="multiple"
            defaultValue={['staking']}
            className="w-full max-w-3xl"
          >
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
            <AccordionItem value="first-loss">
              <AccordionTrigger>
                <Trans>How does first-loss protection work?</Trans>
              </AccordionTrigger>
              <AccordionContent>
                <Trans>
                  Staked RSR covers eligible collateral losses before ordinary
                  holders absorb them.
                </Trans>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="archived" disabled>
              <AccordionTrigger disabled>
                <Trans>Archived supporting notes unavailable</Trans>
              </AccordionTrigger>
              <AccordionContent>
                <Trans>Unavailable detail</Trans>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DocumentationSpecimenCell>
        <DocumentationSpecimenCell
          label={<Trans>Single · unusually long detail</Trans>}
        >
          <Accordion
            type="single"
            collapsible
            defaultValue="changes"
            className="w-full max-w-3xl"
          >
            <AccordionItem value="changes">
              <AccordionTrigger>
                <Trans>What changed in this version?</Trans>
              </AccordionTrigger>
              <AccordionContent>
                <Trans>
                  The update clarifies collateral-based issuance and expands the
                  explanation of governance-controlled parameters.
                </Trans>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="previous-version">
              <AccordionTrigger>
                <Trans>Previous version details</Trans>
              </AccordionTrigger>
              <AccordionContent>
                <Trans>
                  The earlier version remains available for comparison.
                </Trans>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DocumentationSpecimenCell>
      </div>
    )
  }

  if (itemId === 'collapsible') {
    return (
      <div className="w-full space-y-8">
        <DocumentationSpecimenCell label={<Trans>Independent · resting</Trans>}>
          <Collapsible className="w-full max-w-3xl">
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
        <DocumentationSpecimenCell
          label={<Trans>Independent · expanded</Trans>}
        >
          <Collapsible defaultOpen className="w-full max-w-3xl">
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
        <DocumentationSpecimenCell
          label={<Trans>Independent · unavailable</Trans>}
        >
          <Collapsible className="w-full max-w-3xl">
            <CollapsibleTrigger disabled>
              <Trans>Unavailable details</Trans>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Trans>Unavailable detail</Trans>
            </CollapsibleContent>
          </Collapsible>
        </DocumentationSpecimenCell>
      </div>
    )
  }

  return null
}
