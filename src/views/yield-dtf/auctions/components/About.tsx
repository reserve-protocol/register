import { Trans } from '@lingui/macro'
import { cn } from '@/lib/utils'

interface AboutProps {
  className?: string
}

/**
 * Section: Auction > About auctions footer
 */
const About = ({ className }: AboutProps) => (
  <div className={cn(className)}>
    <h2 className="text-2xl font-bold pl-4">About</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 mt-12 px-4 gap-6 lg:gap-12">
      <div>
        <p className="font-medium mb-4">
          <Trans>
            The Reserve Protocol makes a few different types of trades
          </Trans>
        </p>
        <ul>
          <li className="text-muted-foreground mb-4">
            [FREQUENT] From collateral to RSR or RToken, in order to distribute
            collateral yields. These happen often.
          </li>
          <li className="text-muted-foreground mb-4">
            [FREQUENT] From reward tokens to RSR or RToken, in order to
            distribute tokens rewards from collateral. These also happen often.
          </li>
          <li className="text-muted-foreground mb-4">
            [FREQUENT] From RToken to RSR, in order to distribute revenue that
            has accrued evenly across all collateral tokens in the basket to
            stRSR holders.
          </li>
          <li className="text-muted-foreground mb-4">
            [RARE] From collateral to collateral, in order to execute a basket
            change proposal that has passed through governance.
          </li>
          <li className="text-muted-foreground mb-6">
            [RARE] RSR to collateral, in order to recollateralize the protocol
            from the stRSR over-collateralization, after a basket change. These
            auctions should be even rarer, happening when there's a basket
            change and insufficient capital to achieve recollateralization
            without using the over-collateralization buffer.
          </li>
        </ul>
        <p className="text-muted-foreground mb-4">
          <Trans>
            Each type of trade can currently happen in only one way; the
            protocol launches a Gnosis EasyAuction. The Reserve Protocol is
            designed to make it easy to add other trading methods, but no other
            methods are currently supported.
          </Trans>
        </p>
        <p className="text-muted-foreground mb-4">
          <Trans>
            A good explainer for how Gnosis auctions work can be found
          </Trans>{' '}
          <a
            className="underline"
            href="https://github.com/gnosis/ido-contracts"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Trans>(in their Github repository)</Trans>
          </a>
        </p>
      </div>
      <div>
        <p className="font-medium mb-4">
          <Trans>Trigger an Auction</Trans>
        </p>
        <p className="text-muted-foreground mb-6">
          <Trans>
            Anyone can click the button above to check and trigger an auction
            for any revenue that has accrued or for rebalances that need to
            happen. Please note that for RTokens with many collateral types in
            the basket, this may be an expensive transaction to execute.
          </Trans>
        </p>
      </div>
    </div>
  </div>
)

export default About
