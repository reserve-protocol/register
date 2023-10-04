import Layout from 'components/rtoken-setup/Layout'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { interfaceMapAtom } from 'views/governance/atoms'
import ProposalDetailNavigation from '../../proposal-detail/components/ProposalDetailNavigation'
import useProposalTx from '../hooks/useProposalTx'
import ConfirmProposalForm from './ConfirmProposalForm'
import ConfirmProposalOverview from './ConfirmProposalOverview'
import SimulateProposal from './SimulateProposal'

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
    <Layout>
      <ProposalDetailNavigation sections={navigationSections} />
      <ConfirmProposalForm addresses={tx.args[0]} calldatas={tx.args[2]} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ConfirmProposalOverview tx={tx} />
        <SimulateProposal tx={tx} />
      </div>
    </Layout>
  )
}

export default ConfirmProposal
