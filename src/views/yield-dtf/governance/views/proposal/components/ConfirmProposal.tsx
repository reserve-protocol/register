import { useState } from 'react'
import { Trans } from '@lingui/react/macro'
import { Button } from '@/components/ui/button'
import { useAtomValue, useSetAtom } from 'jotai'
import { isProposalEditingAtom } from '../atoms'
import { revenueRouterChangesAtom } from '../revenue-router-atoms'
import useProposalTx from '../hooks/useProposalTx'
import ConfirmProposalForm, { ProposalMetadata } from './ConfirmProposalForm'
import ConfirmProposalOverview from './ConfirmProposalOverview'
import SimulateProposal from './SimulateProposal'

const ConfirmProposal = () => {
  const tx = useProposalTx()
  // Keep authoring metadata when a failed/stale read temporarily unmounts confirmation.
  const [metadata, setMetadata] = useState<ProposalMetadata>({
    title: '',
    rfc: '',
    description: '',
  })
  const routerChanges = useAtomValue(revenueRouterChangesAtom)
  const setEditing = useSetAtom(isProposalEditingAtom)

  if (!routerChanges.valid) {
    return (
      <div
        className="p-8"
        role="alert"
        data-testid="destinations-confirmation-invalid"
      >
        <p>
          <Trans>
            Revenue router configuration changed or could not be verified.
            Return to editing and review the refreshed destinations.
          </Trans>
        </p>
        <Button className="mt-4" onClick={() => setEditing(true)}>
          <Trans>Return to editing</Trans>
        </Button>
      </div>
    )
  }

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
        <ConfirmProposalForm
          addresses={tx.args[0]}
          calldatas={tx.args[2]}
          metadata={metadata}
          onMetadataChange={setMetadata}
        />
        <div className="sticky top-6">
          <ConfirmProposalOverview tx={tx} />
          <SimulateProposal className="mt-6" tx={tx} />
        </div>
      </div>
    </div>
  )
}

export default ConfirmProposal
