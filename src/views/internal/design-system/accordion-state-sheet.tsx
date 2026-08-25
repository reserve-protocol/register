import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/design-system-v1/accordion'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'

const AccordionStateSheet = () => (
  <section
    data-testid="accordion-state-sheet"
    className="space-y-8"
    aria-labelledby="accordion-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">Provisional candidate</p>
      <h2 id="accordion-state-sheet-title" className="mt-1 text-xl font-medium">
        Informational disclosure stack
      </h2>
      <p
        className={cn(
          'mt-1 max-w-3xl text-muted-foreground',
          v1Typography.supporting
        )}
      >
        Judge the shared trigger, divider-free grouping, hover target, and
        expanded-content relationship in two source-grounded hosts: a staking
        FAQ section and a whitepaper change summary. The surrounding section
        hierarchy and hosted content are context, not Accordion API. Radix still
        owns single or multiple expansion and keyboard behavior.
      </p>
    </div>

    <section className="bg-card p-6" aria-labelledby="staking-faq-title">
      <div className="max-w-3xl">
        <h3 id="staking-faq-title" className="text-2xl font-light">
          Staking frequently asked questions
        </h3>
        <p
          className={cn('mt-2 text-muted-foreground', v1Typography.supporting)}
        >
          Understand rewards, first-loss protection, unstaking, and the risks
          involved before depositing RSR.
        </p>
      </div>

      <div className="-mx-4 -mb-4 mt-4 max-w-4xl">
        <Accordion type="multiple" defaultValue={['staking']}>
          <AccordionItem value="staking">
            <AccordionTrigger data-testid="design-system-accordion-staking-trigger">
              What is staking?
            </AccordionTrigger>
            <AccordionContent>
              Staking deposits RSR into a Yield DTF to provide first-loss
              capital and participate in governance. In return for taking on
              that risk, stakers earn a share of the DTF’s yield and fees.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="first-loss">
            <AccordionTrigger data-testid="design-system-accordion-unstaking-trigger">
              How does first-loss capital protect DTF holders?
            </AccordionTrigger>
            <AccordionContent>
              If the DTF’s collateral loses value or defaults, staked RSR is
              sold to cover the shortfall before ordinary DTF holders absorb
              that loss.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="unstaking">
            <AccordionTrigger>
              Can I unstake my RSR at any time?
            </AccordionTrigger>
            <AccordionContent>
              Unstaking begins a governance-defined cooldown. The RSR remains
              locked until that period ends and can then be withdrawn.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="risk">
            <AccordionTrigger>
              What market, liquidity, governance, and smart-contract risks
              should I evaluate before staking?
            </AccordionTrigger>
            <AccordionContent>
              Review the DTF’s collateral, governance parameters, liquidity, and
              contract risk. Staked RSR is the first capital auctioned when
              collateral losses need to be covered.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>

    <div className="bg-secondary p-0.5">
      <article className="bg-card p-6" aria-labelledby="whitepaper-title">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h3 id="whitepaper-title" className="text-xl font-medium">
              CFB Token Whitepaper
            </h3>
            <p
              className={cn(
                'mt-2 text-muted-foreground',
                v1Typography.supporting
              )}
            >
              Review the current collateral-basket model and the material
              changes from the previous version.
            </p>
          </div>
          <p className="text-sm font-light text-muted-foreground">
            Published 18 June 2025
          </p>
        </div>

        <div className="-mx-4 -mb-4 mt-4">
          <Accordion type="single" collapsible defaultValue="changes">
            <AccordionItem value="changes">
              <AccordionTrigger>What changed in this version?</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>
                    The update clarifies collateral-based issuance, removes
                    obsolete formatting guidance, and expands the explanation of
                    governance-controlled parameters.
                  </p>
                  <p>
                    These details belong to the hosted document summary;
                    Accordion owns only their disclosure relationship.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="previous-version">
              <AccordionTrigger>Previous version details</AccordionTrigger>
              <AccordionContent>
                The earlier paper remains available for readers who need to
                compare terminology and issuance mechanics.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="archived" disabled>
              <AccordionTrigger disabled>
                Archived supporting notes unavailable
              </AccordionTrigger>
              <AccordionContent>Unavailable detail</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </article>
    </div>

    <p
      className={cn(
        'border border-border bg-card p-4 text-muted-foreground',
        v1Typography.supporting
      )}
    >
      Review only the disclosure rows inside these hosts. Accordion does not
      authorize the section titles, documentation metadata, task progress,
      validation, completion marks, edit actions, or custom step headers. A
      single independent disclosure remains separate Collapsible work.
    </p>
  </section>
)

export default AccordionStateSheet
