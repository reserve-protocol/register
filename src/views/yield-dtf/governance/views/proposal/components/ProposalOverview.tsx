import { Trans } from '@lingui/macro'
import { useAtomValue, useSetAtom } from 'jotai'
import { Button } from '@/components/ui/button'
import { isProposalEditingAtom, isProposalValidAtom } from '../atoms'
import CreateProposalActionIcon from 'components/icons/CreateProposalActionIcon'
import ProposalPreview from './ProposalPreview'
import { cn } from '@/lib/utils'

interface Props {
  className?: string
}

const ProposalOverview = ({ className }: Props) => {
  const isValid = useAtomValue(isProposalValidAtom)
  const setProposalEditing = useSetAtom(isProposalEditingAtom)

  // Change to confirmation screen
  const handleProposal = () => {
    setProposalEditing(false)
  }

  return (
    <div className={cn('h-fit sticky top-0 p-0', className)}>
      <div className="max-h-[calc(100vh-124px)] flex flex-col overflow-hidden">
        <div className="flex items-center flex-col text-center border border-border rounded-3xl p-4">
          <CreateProposalActionIcon />
          <span className="text-xl font-medium mb-2">
            <Trans>Confirm changes made</Trans>
          </span>
          <p className="text-legend">
            Preview of function calls & adding of a proposal description is
            added in the next step.
          </p>
          <Button
            onClick={handleProposal}
            disabled={!isValid}
            className="mt-6 w-full"
          >
            <Trans>Confirm & prepare proposal</Trans>
          </Button>
        </div>
        <ProposalPreview className="grow overflow-auto" />
      </div>
    </div>
  )
}

export default ProposalOverview
