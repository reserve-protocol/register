import { Trans } from '@lingui/macro'
import { Button } from '@/components/ui/button'
import { useSetAtom } from 'jotai'
import { wrapSidebarAtom } from '@/views/yield-dtf/issuance/atoms'

const About = () => {
  const setWrapping = useSetAtom(wrapSidebarAtom)

  return (
    <div className="h-fit">
      <div className="p-7">
        <span className="font-semibold mb-2 block">
          <Trans>Regular minting </Trans>
        </span>
        <p className="text-legend">
          <Trans>
            Minting requires a deposit of the defined collateral tokens in equal
            value amounts to the RToken smart contracts.
          </Trans>
        </p>

        <span className="font-semibold mt-6 mb-2 block">
          <Trans>Wrapping collateral tokens</Trans>
        </span>
        <p className="text-legend">
          <Trans>
            Some collateral tokens from protocols like Aave and Convex differ
            technically from other collateral tokens. To ensure proper handling,
            they must be wrapped in a contract for effective monitoring. Once
            wrapped, the collateral remains the same but has a new interface for
            price and appreciation tracking.
          </Trans>
        </p>
        <div className="flex mt-4">
          <Button
            size="sm"
            variant="ghost"
            data-testid="wrap-btn"
            onClick={() => setWrapping(true)}
            className="mr-4"
          >
            <Trans>Wrap/Unwrap collateral</Trans>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default About
