import TokenLogo from '@/components/token-logo'
import { Box } from '@/components/ui/box'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { iTokenAtom, iTokenGovernanceAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Fingerprint } from 'lucide-react'

const GovernanceDetails = () => {
  const governance = useAtomValue(iTokenGovernanceAtom)

  if (!governance) {
    return (
      <div>
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-16 -m-4 mt-4  rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center flex-wrap gap-2">
        <Box variant="circle" className="bg-black text-white"></Box>
        <span className="font-bold mr-auto">
          Governor proposes a change to the basket
        </span>
        <span className="text-sm text-legend">
          Any {governance.token.symbol} staker
        </span>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <Box variant="circle" className="bg-black text-white"></Box>
        <span className="font-bold mr-auto">30 minute voting period </span>
        <span className="text-sm text-legend">
          Requires majority ‘yes’ & quorum to pass
        </span>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <Box variant="circle" className="bg-black text-white"></Box>
        <span className="font-bold mr-auto">
          A price curator executes the change
        </span>
        <span className="text-sm text-legend">
          Guardian can veto up until trading happens
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-black/5 p-4 -m-4 mt-2">
        <TokenLogo symbol={governance.token.symbol} />
        <div className="mr-auto">
          <h4 className="font-bold">
            Stake ${governance.token.symbol} to participate
          </h4>
          <span className="legend">
            Earn ≈2.4% APY as a reward for governing
          </span>
        </div>
        <Box variant="circle" className="h-8 w-8">
          <ArrowUpRight size={16} />
        </Box>
      </div>
    </div>
  )
}

const IndexGovernanceOverview = () => {
  const token = useAtomValue(iTokenAtom)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <Fingerprint size={20} />
        </div>
      </div>
      <div>
        <h2 className="text-4xl mb-2">Governance</h2>

        <p className="text-legend">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <div className="my-4 flex items-center gap-2">
          <h3 className="text-xl text-primary mr-auto font-bold">
            How changes to ${token?.symbol || 'DTF'} occur
          </h3>
          <Box variant="circle" className="h-8 w-8">
            <ArrowUpRight size={16} />
          </Box>
        </div>

        <GovernanceDetails />
      </div>
    </Card>
  )
}

export default IndexGovernanceOverview
