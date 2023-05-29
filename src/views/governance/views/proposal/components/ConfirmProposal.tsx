import Layout from 'components/rtoken-setup/Layout'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { interfaceMapAtom } from 'views/governance/atoms'
import ProposalDetailNavigation from '../../proposal-detail/components/ProposalDetailNavigation'
import useProposalTx from '../hooks/useProposalTx'
import ConfirmProposalForm from './ConfirmProposalForm'
import ConfirmProposalOverview from './ConfirmProposalOverview'

// TODO: Build proposal
const ConfirmProposal = () => {
  const tx = useProposalTx()
  const interfaceMap = useAtomValue(interfaceMapAtom)

  const navigationSections = useMemo(() => {
    const contractMap: { [x: string]: string } = {}

    if (tx?.call.args[0]) {
      for (const address of tx.call.args[0]) {
        contractMap[address] = interfaceMap[address]?.label ?? 'Unknown'
      }
    }

    return Object.values(contractMap)
  }, [tx?.call.args.length])

  // TODO: Loading state
  if (!tx) {
    return null
  }

  return (
    <Layout>
      <ProposalDetailNavigation sections={navigationSections} />
      <ConfirmProposalForm tx={tx} />
      <ConfirmProposalOverview tx={tx} />
    </Layout>
  )
}

export default ConfirmProposal
