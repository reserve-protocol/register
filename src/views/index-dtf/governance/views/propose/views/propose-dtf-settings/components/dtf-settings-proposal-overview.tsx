import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import Timeline from '@/components/ui/timeline'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { useAtom, useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import {
  isProposalConfirmedAtom,
  isProposalValidAtom,
  isFormValidAtom,
} from '../atoms'
import DTFSettingsProposalChanges from './dtf-settings-proposal-changes'
import SubmitProposalButton from './submit-proposal-button'

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
      className="w-full"
      disabled={!isButtonEnabled}
      variant={isProposalConfirmed ? 'outline' : 'default'}
      onClick={handleConfirm}
    >
      {isProposalConfirmed ? 'Edit proposal' : 'Confirm & prepare proposal'}
    </Button>
  )
}

const ProposalInstructions = () => {
  const isValid = useAtomValue(isProposalValidAtom)
  const isFormValid = useAtomValue(isFormValidAtom)
  const confirmed = useAtomValue(isProposalConfirmedAtom)

  console.log('is valid', { isValid, isFormValid })
  const canProceed = isValid && isFormValid

  const timelineItems = [
    {
      title: 'Configure proposal',
      isActive: !canProceed,
      isCompleted: canProceed,
    },
    {
      title: 'Finalize basket proposal',
      children: <ConfirmProposalButton />,
      isActive: canProceed && !confirmed,
      isCompleted: confirmed,
    },
    {
      title: 'Review & describe your proposal',
      children: <SubmitProposalButton />,
      isActive: confirmed,
    },
    {
      title: 'Voting delay begins',
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
          Cancel
        </Button>
      </Link>
    </div>
  )
}

const VaultProposalChangePreview = () => {
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)

  if (isProposalConfirmed) return null

  return (
    <div className="mt-2 border-4 border-secondary rounded-3xl bg-background p-2">
      <h3 className="font-bold mb-6 text-primary px-4 pt-4">
        Proposed changes
      </h3>
      <DTFSettingsProposalChanges />
    </div>
  )
}

const DTFSettingsProposalOverview = () => {
  return (
    <div className="fit-content overflow-hidden w-full">
      <div className="border-4 border-secondary rounded-3xl bg-background">
        <Header />
        <ProposalInstructions />
      </div>
      <VaultProposalChangePreview />
    </div>
  )
}

export default DTFSettingsProposalOverview
