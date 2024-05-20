import GovernanceParameters from 'components/rtoken-setup/governance/GovernanceParameters'
import { useAtomValue } from 'jotai'
import { rTokenGovernanceAtom } from 'state/atoms'
import { Box, Card } from 'theme-ui'
import { isTimeunitGovernance } from 'views/governance/utils'

const ProposalGovernanceParams = () => {
  const governance = useAtomValue(rTokenGovernanceAtom)
  const isTimeunit = isTimeunitGovernance(governance.name)

  return (
    <Card p={4} pb={1}>
      <GovernanceParameters timebased={isTimeunit} />
    </Card>
  )
}

export default ProposalGovernanceParams
