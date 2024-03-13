import Layout from 'components/rtoken-setup/Layout'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { interfaceMapAtom } from 'views/governance/atoms'
import ProposalDetailNavigation from '../../proposal-detail/components/ProposalDetailNavigation'
import useProposalTx from '../hooks/useProposalTx'
import ConfirmProposalForm from './ConfirmProposalForm'
import ConfirmProposalOverview from './ConfirmProposalOverview'
import SimulateProposal from './SimulateProposal'
import { Container, Grid } from 'theme-ui'

const ConfirmProposal = () => {
  const tx = useProposalTx()
  const interfaceMap = useAtomValue(interfaceMapAtom)

  const navigationSections = useMemo(() => {
    const contractMap: { [x: string]: string } = {}

    if (tx?.args[0]) {
      for (const address of tx.args[0]) {
        contractMap[address] = interfaceMap[address]?.label ?? 'Unknown'
      }
    }

    return Object.values(contractMap)
  }, [tx])

  // TODO: Loading state
  if (!tx) {
    return null
  }

  return (
    <Grid
      columns={['1fr', '1fr', '1.5fr 1fr']}
      gap={5}
      p={[1, 6]}
      sx={{
        position: 'relative',
        justifyContent: 'center',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
      }}
    >
      <ConfirmProposalForm addresses={tx.args[0]} calldatas={tx.args[2]} />
      <Container variant="layout.sticky">
        <ConfirmProposalOverview tx={tx} />
        <SimulateProposal mt="4" tx={tx} />
      </Container>
    </Grid>
  )
}

export default ConfirmProposal
