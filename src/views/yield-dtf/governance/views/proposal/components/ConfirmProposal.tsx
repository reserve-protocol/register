import useProposalTx from '../hooks/useProposalTx'
import ConfirmProposalForm from './ConfirmProposalForm'
import ConfirmProposalOverview from './ConfirmProposalOverview'
import SimulateProposal from './SimulateProposal'

const ConfirmProposal = () => {
  const tx = useProposalTx()

  // TODO: Loading state
  if (!tx) {
    return null
  }

  return (
    <div
      className="grid gap-8 p-1 sm:p-8 relative justify-center content-start items-start"
      style={{
        gridTemplateColumns: 'repeat(1, 1fr)',
      }}
    >
      <style>{`
        @media (min-width: 832px) {
          .confirm-proposal-grid {
            grid-template-columns: 1.5fr 1fr;
          }
        }
      `}</style>
      <div className="confirm-proposal-grid grid gap-8 relative justify-center content-start items-start">
        <ConfirmProposalForm addresses={tx.args[0]} calldatas={tx.args[2]} />
        <div className="sticky top-6">
          <ConfirmProposalOverview tx={tx} />
          <SimulateProposal className="mt-6" tx={tx} />
        </div>
      </div>
    </div>
  )
}

export default ConfirmProposal
