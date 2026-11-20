import ProposalDescriptionForm from '@/components/governance/proposal-description-form'
import { Button, type ButtonProps } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useIsMobile } from '@/hooks/use-media-query'
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
  const isMobile = useIsMobile()
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
        // Focus on open selects the default title, and one keystroke replaces the text that dedupe matches.
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="max-h-[90dvh] overflow-y-auto max-w-full sm:max-w-2xl top-[100%] translate-y-[-100%] sm:top-[50%] sm:translate-y-[-50%] rounded-b-none rounded-t-3xl sm:rounded-3xl data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out"
      >
        <DialogTitle className="pr-8">
          <Trans>Create proposal</Trans>
        </DialogTitle>
        <fieldset disabled={disabled} className="min-w-0">
          <ProposalDescriptionForm
            initialTitle={initialTitle}
            initialDescription={initialDescription}
            editorPreview={isMobile ? 'edit' : 'live'}
            onChange={setDescription}
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
        {!disabled && !description && (
          <p
            data-testid="governance-upgrade-title-required"
            className="text-sm text-legend text-center"
          >
            <Trans>Enter a proposal title to continue.</Trans>
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
