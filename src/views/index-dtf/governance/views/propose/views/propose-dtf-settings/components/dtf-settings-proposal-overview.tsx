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
  dtfSettingsProposalDataAtom,
  proposalDescriptionAtom,
} from '../atoms'
import DTFSettingsProposalChanges from './dtf-settings-proposal-changes'
import SubmitProposalButton from './submit-proposal-button'
import SimulateProposal from '@/views/index-dtf/governance/components/simulate-proposal'
import useProposalSimulation from '@/hooks/use-proposal-simulation'
import { chainIdAtom } from '@/state/atoms'
import { Address } from 'viem'
import { useEffect, useRef } from 'react'

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

const ProposalOverview = () => {
  return (
    <div className="border-4 border-secondary rounded-3xl bg-background">
      <Header />
      <ProposalInstructions />
    </div>
  )
}

const SimulateProposalCard = () => {
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)
  const proposalData = useAtomValue(dtfSettingsProposalDataAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  const governorAddress = indexDTF?.ownerGovernance?.id as Address
  const timelockAddress = indexDTF?.ownerGovernance?.timelock?.id as Address
  const voteTokenAddress = indexDTF?.stToken?.id as Address

  const { data, loading, error, isReady, handleSimulation, resetSimulation } =
    useProposalSimulation(
      governorAddress,
      timelockAddress,
      voteTokenAddress,
      chainId
    )

  // Track last simulated proposal data to detect changes
  const lastSimulatedDataRef = useRef<string>('')

  // Auto-trigger simulation when proposal is confirmed and data changes
  useEffect(() => {
    if (!isProposalConfirmed || !proposalData || !isReady) return

    // Serialize proposal data for comparison (targets + calldatas)
    const currentData = JSON.stringify({
      targets: proposalData.targets,
      calldatas: proposalData.calldatas,
    })

    // Only simulate if proposal data has changed
    if (currentData !== lastSimulatedDataRef.current) {
      // Reset previous simulation state
      resetSimulation()

      // Construct simulation config
      const config = {
        targets: proposalData.targets,
        values: proposalData.calldatas.map(() => 0n), // DTF settings proposals have no value transfers
        calldatas: proposalData.calldatas,
        description: 'Proposal Simulation Test', // Mock description for simulation
      }

      // Trigger simulation
      handleSimulation(config)

      // Update ref to track what we just simulated
      lastSimulatedDataRef.current = currentData
    }
  }, [
    isProposalConfirmed,
    proposalData,
    isReady,
    handleSimulation,
    resetSimulation,
  ])

  // Manual simulation trigger (for re-running after auto-simulation)
  const onSimulate = () => {
    if (!proposalData) return

    const config = {
      targets: proposalData.targets,
      values: proposalData.calldatas.map(() => 0n),
      calldatas: proposalData.calldatas,
      description: 'Proposal Simulation Test',
    }

    handleSimulation(config)
  }

  if (!isProposalConfirmed) return null

  return (
    <SimulateProposal
      isLoading={loading}
      simulation={data}
      error={error}
      onSimulate={onSimulate}
      isReady={isReady && !!proposalData}
    />
  )
}

const DTFSettingsProposalOverview = () => {
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)

  return (
    <div className="flex flex-col gap-2 relative">
      <div className={!isProposalConfirmed ? "sticky top-0" : ""}>
        <ProposalOverview />
      </div>
      <VaultProposalChangePreview />
      <SimulateProposalCard />
    </div>
  )
}

export default DTFSettingsProposalOverview
