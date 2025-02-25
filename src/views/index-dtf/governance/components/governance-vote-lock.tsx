import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import Staking from '../../overview/components/staking'

const Placeholder = () => (
  <div className="rouend-3xl bg-background space-y-6 p-2 rounded-3xl">
    {/* Header */}
    <div className="flex px-4 pt-4 items-center justify-between">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>

    {/* Title */}
    <div className="space-y-2 mx-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>

    {/* Vote-lock Button/Card */}
    <div className="mt-6">
      <Skeleton className="h-14 w-full rounded-lg" />
    </div>
  </div>
)

// TODO: Display other DTF governed by this token
const GovernanceVoteLock = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!indexDTF) {
    return <Placeholder />
  }

  if (!indexDTF.stToken) return null

  return (
    <div className="rounded-3xl bg-background p-2">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <TokenLogo
            size="xl"
            symbol={indexDTF.stToken.underlying.symbol}
            address={indexDTF.stToken.underlying.address}
            chain={chainId}
          />
        </div>
        <h4 className="text-lg font-bold break-words mb-1">
          Governed by ${indexDTF.stToken.token.symbol}
        </h4>
        <p className="text-sm text-legend">
          ${indexDTF.stToken.underlying.symbol} holders must vote-lock their
          tokens to become a governor. In exchange for locking their tokens and
          participating in governance, governors earn a portion of the TVL fee
          charged by the DTF.
        </p>
      </div>

      <Staking>
        <Button variant="outline" className="w-full gap-1">
          <TokenLogo
            size="sm"
            symbol={indexDTF.stToken.underlying.symbol}
            address={indexDTF.stToken.underlying.address}
            chain={chainId}
          />
          <span className="text-primary">
            Vote-lock ${indexDTF.stToken.underlying.symbol}
          </span>
        </Button>
      </Staking>
    </div>
  )
}

export default GovernanceVoteLock
