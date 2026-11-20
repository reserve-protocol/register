import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import { Button, type ButtonProps } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { Trans } from '@lingui/react/macro'
import { useState } from 'react'

interface UpgradeProposalButtonProps extends Omit<
  ButtonProps,
  'onClick' | 'onSubmit'
> {
  initialTitle: string
  initialDescription: string
  onSubmit: (description: string) => void
}

export default function UpgradeProposalButton({
  initialTitle,
  initialDescription,
  onSubmit,
  children,
  disabled,
  ...props
}: UpgradeProposalButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [description, setDescription] = useState('')
  const { trackClick } = useTrackIndexDTFClick('governance', 'propose')

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          setDescription('')
          trackClick('upgrade_proposal_details')
        }
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button {...props} type="button" disabled={disabled}>
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent
        data-testid="governance-upgrade-details"
        aria-describedby={undefined}
        className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogTitle className="pr-8">
          <Trans>Create proposal</Trans>
        </DialogTitle>
        <fieldset disabled={disabled} className="min-w-0">
          <ProposalDescriptionForm
            initialTitle={initialTitle}
            initialDescription={initialDescription}
            onChange={setDescription}
            onBack={() => setIsOpen(false)}
          />
        </fieldset>
        <Button
          type="button"
          data-testid="governance-upgrade-submit-btn"
          disabled={disabled || !description}
          onClick={() => {
            trackClick('submit_upgrade_proposal')
            onSubmit(description)
          }}
        >
          {disabled ? children : <Trans>Create proposal</Trans>}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
