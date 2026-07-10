import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import Timeline from '@/components/ui/timeline'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import { isProposalConfirmedAtom, isProposalValidAtom, isFormValidAtom } from '../atoms'
import SubmitProposalButton from './submit-proposal-button'
import DaoSettingsProposalChanges from './dao-settings-proposal-changes'

const ConfirmProposalButton = () => {
  const isValid = useAtomValue(isProposalValidAtom)
  const isFormValid = useAtomValue(isFormValidAtom)
  const [isProposalConfirmed, setIsProposalConfirmed] = useAtom(
    isProposalConfirmedAtom
  )

  const handleConfirm = () => {
    if (!isProposalConfirmed) {
      // When confirming, check if form is valid
      if (!isFormValid) {
        // The form will show validation errors
        return
      }
    }
    setIsProposalConfirmed(!isProposalConfirmed)
  }

  // Enable button only if there are changes AND form is valid
  const isButtonEnabled = isValid && isFormValid

  return (
    <Button
      data-testid="propose-confirm-btn"
      className="w-full"
      disabled={!isButtonEnabled}
      variant={isProposalConfirmed ? 'outline' : 'default'}
      onClick={handleConfirm}
    >
      {isProposalConfirmed ? (
        <Trans>Edit proposal</Trans>
      ) : (
        <Trans>Confirm & prepare proposal</Trans>
      )}
    </Button>
  )
}

const ProposalInstructions = () => {
  const { t } = useLingui()
  const isValid = useAtomValue(isProposalValidAtom)
  const isFormValid = useAtomValue(isFormValidAtom)
  const confirmed = useAtomValue(isProposalConfirmedAtom)

  const canProceed = isValid && isFormValid

  const timelineItems = [
    {
      title: t`Configure proposal`,
      isActive: !canProceed,
      isCompleted: canProceed,
    },
    {
      title: t`Finalize DAO proposal`,
      children: <ConfirmProposalButton />,
      isActive: canProceed && !confirmed,
      isCompleted: confirmed,
    },
    {
      title: t`Review & describe your proposal`,
      children: <SubmitProposalButton />,
      isActive: confirmed,
    },
    {
      title: t`Voting delay begins`,
    },
  ]

  return (
    <div className="p-4 pr-10 ml-4 mb-4 w-full">
      <Timeline items={timelineItems} />
    </div>
  )
}

const Header = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const brand = useAtomValue(indexDTFBrandAtom)

  return (
    <div className="flex items-center p-6 gap-2 bg-card rounded-t-3xl">
      <TokenLogo size="lg" src={brand?.dtf?.icon || undefined} />
      <h3 className="font-bold mr-auto">${dtf?.token.symbol}</h3>
      <Link to={`../${ROUTES.GOVERNANCE}`}>
        <Button
          variant="outline"
          size="xs"
          className="rounded-[42px] font-light text-destructive hover:text-destructive"
        >
          <Trans>Cancel</Trans>
        </Button>
      </Link>
    </div>
  )
}

const DaoProposalChangePreview = () => {
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isProposalConfirmed) return null

  return (
    <div className="mt-2 border-4 border-secondary rounded-3xl bg-background p-2">
      <h3 className="font-bold mb-6 text-primary px-4 pt-4">
        <Trans>Proposed changes</Trans>
      </h3>
      <DaoSettingsProposalChanges />
    </div>
  )
}

const ProposalOverview = () => {
  return (
    <div className="border-4 border-secondary rounded-3xl bg-background">
      <Header />
      <ProposalInstructions />
    </div>
  )
}

const DaoSettingsProposalOverview = () => {
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)

  return (
    <div className="flex flex-col gap-2 relative">
      <div className={!isProposalConfirmed ? "sticky top-0" : ""}>
        <ProposalOverview />
      </div>
      <DaoProposalChangePreview />
    </div>
  )
}

export default DaoSettingsProposalOverview
