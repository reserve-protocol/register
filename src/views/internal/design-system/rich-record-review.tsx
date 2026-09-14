import GovernanceProposalStateReview from './governance-proposal-state-review'
import { AuctionsBrowseReview } from './auctions-browse/review'

const RichRecordReview = () => (
  <section
    data-testid="rich-record-review"
    className="space-y-4"
    aria-labelledby="rich-record-review-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">Visual decision</p>
      <h2 id="rich-record-review-title" className="mt-1 text-xl font-medium">
        Governance and rebalance lists
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-5 text-muted-foreground">
        Proposal and rebalance review fixtures use the accepted typography,
        spacing, color, and shape rules. Review each family in its own evidenced
        composition before comparing their shared grammar.
      </p>
    </div>
    <div className="space-y-10">
      <GovernanceProposalStateReview
        reviewScope={
          <aside className="border border-border bg-card p-4 text-sm font-light leading-5 text-muted-foreground">
            <p className="font-medium text-foreground">Review now</p>
            <ul className="mt-2 space-y-2">
              <li>
                Lifecycle timing on active proposals; no strip on closed
                proposals.
              </li>
              <li>
                One status pill, visible deadlines, and a quieter outcome.
              </li>
              <li>
                Quorum and vote evidence for standard proposals versus challenge
                evidence for optimistic proposals.
              </li>
              <li>
                Fast and Contested as qualifiers rather than lifecycle states.
              </li>
            </ul>
            <div className="mt-4">
              <p className="font-medium text-foreground">Leave for later</p>
              <p className="mt-2">
                Final production adoption, colored vote-role aliases, and final
                route-level responsive transformation.
              </p>
            </div>
          </aside>
        }
      />
      <AuctionsBrowseReview />
      <div className="border-t border-border pt-4 text-sm font-light leading-5 text-muted-foreground">
        <p className="font-medium text-foreground">Compare only after review</p>
        <p className="mt-1 max-w-3xl">
          Compare their shared 24px content axis, 16px/500 titles and neutral
          text treatment. Governance retains its record composition; historical
          rebalances now trial table columns, with the current-rebalance
          workspace reviewed above history. These are not one universal Row
          component.
        </p>
      </div>
    </div>
  </section>
)

export default RichRecordReview
