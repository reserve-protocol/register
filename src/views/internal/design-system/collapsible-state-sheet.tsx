import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/design-system-v1/collapsible'
import { v1Typography } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'

const CollapsibleStateSheet = () => (
  <section
    data-testid="collapsible-state-sheet"
    className="space-y-8"
    aria-labelledby="collapsible-state-sheet-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">Provisional candidate</p>
      <h2
        id="collapsible-state-sheet-title"
        className="mt-1 text-xl font-medium"
      >
        Independent disclosure region
      </h2>
      <p
        className={cn(
          'mt-1 max-w-3xl text-muted-foreground',
          v1Typography.supporting
        )}
      >
        Review one independently controlled disclosure that inherits the
        accepted Accordion row language without gaining set coordination. Radix
        owns open state and accessibility; the host still owns the surrounding
        card, the trigger label, and all revealed content.
      </p>
    </div>

    <section className="bg-card p-6" aria-labelledby="auction-limit-title">
      <div className="max-w-3xl">
        <h3 id="auction-limit-title" className="text-2xl font-light">
          Auction configuration
        </h3>
        <p
          className={cn('mt-2 text-muted-foreground', v1Typography.supporting)}
        >
          Review optional settings without turning independently useful regions
          into an Accordion set.
        </p>
      </div>

      <div className="-mx-4 -mb-4 mt-4 max-w-4xl">
        <Collapsible defaultOpen>
          <CollapsibleTrigger
            cue={{ closed: 'Show details', open: 'Hide details' }}
          >
            Maximum auction size per token
          </CollapsibleTrigger>
          <CollapsibleContent>
            Set the maximum auction size in USD for each token. The auction
            settings composition supplies the token fields and their values.
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>

    <section className="bg-card p-6" aria-labelledby="token-help-title">
      <div className="max-w-3xl">
        <h3 id="token-help-title" className="text-xl font-medium">
          Token availability
        </h3>
        <p
          className={cn('mt-2 text-muted-foreground', v1Typography.supporting)}
        >
          Supporting information stays available without permanently occupying
          the primary task flow.
        </p>
      </div>

      <div className="-mx-4 -mb-4 mt-4">
        <Collapsible>
          <CollapsibleTrigger
            cue={{ closed: 'Show guidance', open: 'Hide guidance' }}
          >
            Can’t find your token?
          </CollapsibleTrigger>
          <CollapsibleContent>
            You may need to import it with the L2 contract address. The bridge
            flow owns token selection and any related actions.
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>

    <p
      className={cn(
        'border border-border bg-card p-4 text-muted-foreground',
        v1Typography.supporting
      )}
    >
      Review the one-region disclosure relationship, shared trigger anatomy, and
      motion. The host owns specific, truthful trigger and cue copy; the cue is
      optional when the disclosure is already self-evident. Collapsible does not
      coordinate peer items, choose between single and multiple expansion, or
      standardize auction fields, token lists, executable code, and debug
      content.
    </p>
  </section>
)

export default CollapsibleStateSheet
