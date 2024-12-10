import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ITokenGovernance, iTokenGovernanceAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { Fingerprint } from 'lucide-react'

const GovernanceSkeleton = () => {
  return (
    <div>
      <Skeleton />
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </div>
  )
}

const GovernanceDetails = ({
  governance,
}: {
  governance: ITokenGovernance
}) => {
  return <div></div>
}

const IndexGovernanceOverview = () => {
  const governance = useAtomValue(iTokenGovernanceAtom)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2  mb-24">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <Fingerprint size={20} />
        </div>
        <div>
          <h2 className="text-4xl mb-2">Governance</h2>

          <p className="text-legend">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>
        {!governance ? (
          <GovernanceSkeleton />
        ) : (
          <GovernanceDetails governance={governance} />
        )}
      </div>
    </Card>
  )
}

export default IndexGovernanceOverview
