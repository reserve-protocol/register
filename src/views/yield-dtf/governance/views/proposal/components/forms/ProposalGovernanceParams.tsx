import GovernanceParameters from 'components/rtoken-setup/governance/GovernanceParameters'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import { Card } from '@/components/ui/card'
import { isTimeunitGovernance } from '@/views/yield-dtf/governance/utils'

const ProposalGovernanceParams = () => {
  const governance = useAtomValue(rTokenGovernanceAtom)
  const isTimeunit = isTimeunitGovernance(governance.name)

  return (
    <Card className="p-6 pb-1">
      <GovernanceParameters timebased={isTimeunit} />
    </Card>
  )
}

export default ProposalGovernanceParams
