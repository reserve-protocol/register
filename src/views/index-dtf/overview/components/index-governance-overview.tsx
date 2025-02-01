import TokenLogo from '@/components/token-logo'
import { Box } from '@/components/ui/box'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { parseDuration } from '@/utils'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, Fingerprint } from 'lucide-react'
import Staking from './staking'

const GovernanceDetails = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!indexDTF) {
    return (
      <div>
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-16 -m-4 mt-4  rounded-xl" />
      </div>
    )
  }

  if (!indexDTF.ownerGovernance) {
    return <div>Self governed token!</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center flex-wrap gap-2">
        <Box variant="circle" className="bg-black text-white"></Box>
        <span className="font-bold mr-auto">
          Governor proposes a change to the basket
        </span>
        <span className="text-sm text-legend">
          Any {indexDTF.stToken?.token.symbol ?? 'Unknown'} staker
        </span>
      </div>
      <div className="flex items-center flex-wrap gap-2">
        <Box variant="circle" className="bg-black text-white"></Box>
        <span className="font-bold mr-auto">
          {parseDuration(indexDTF.ownerGovernance.votingPeriod)} voting period{' '}
        </span>
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
      <Staking>
        <div
          className="flex items-center gap-2 rounded-xl bg-black/5 p-4 -m-4 mt-2"
          role="button"
        >
          <TokenLogo
            size="xl"
            symbol={indexDTF.stToken?.underlying.symbol}
            address={indexDTF.stToken?.underlying.address ?? 'Unknown'}
            chain={chainId}
          />
          <div className="mr-auto">
            <h4 className="font-bold">
              Stake ${indexDTF.stToken?.underlying.symbol ?? 'Unknown'} to
              participate
            </h4>
            <span className="legend">Earn DTFs as a reward for governing</span>
          </div>
          <Box variant="circle" className="h-8 w-8">
            <ArrowUpRight size={16} />
          </Box>
        </div>
      </Staking>
    </div>
  )
}

const IndexGovernanceOverview = () => {
  const indexDTF = useAtomValue(indexDTFAtom)

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
            How changes to {indexDTF?.token.symbol || 'DTF'} occur
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
