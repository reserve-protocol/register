import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import Timeline from '@/components/ui/timeline'
import { useAtom, useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import {
  isBasketProposalValidAtom,
  isProposalConfirmedAtom,
  basketProposalCalldatasAtom,
  proposalDescriptionAtom,
} from '../atoms'
import SubmitProposalButton from './submit-proposal-button'
import { ROUTES } from '@/utils/constants'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import SimulateProposal from '@/views/index-dtf/governance/components/simulate-proposal'
import useProposalSimulation from '@/hooks/use-proposal-simulation'
import { chainIdAtom } from '@/state/atoms'
import { Address } from 'viem'
import { useEffect, useRef } from 'react'

// TODO: get governance route to navigate back to governance
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

const ConfirmProposalButton = () => {
  const isValid = useAtomValue(isBasketProposalValidAtom)
  const [isProposalConfirmed, setIsProposalConfirmed] = useAtom(
    isProposalConfirmedAtom
  )

  return (
    <Button
      className="w-full"
      disabled={!isValid}
      variant={isProposalConfirmed ? 'outline' : 'default'}
      onClick={() => setIsProposalConfirmed(!isProposalConfirmed)}
    >
      {isProposalConfirmed ? 'Edit proposal' : 'Confirm & prepare proposal'}
    </Button>
  )
}

const ProposalInstructions = () => {
  const isValid = useAtomValue(isBasketProposalValidAtom)
  const confirmed = useAtomValue(isProposalConfirmedAtom)

  const timelineItems = [
    {
      title: 'Configure proposal',
      isActive: !isValid,
      isCompleted: isValid,
    },
    {
      title: 'Finalize basket proposal',
      children: <ConfirmProposalButton />,
      isActive: isValid && !confirmed,
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

const SimulateProposalCard = () => {
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)
  const calldatas = useAtomValue(basketProposalCalldatasAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  // Determine which governance to use (trading for basket changes)
  const governorAddress = indexDTF?.tradingGovernance?.id as Address
  const timelockAddress = indexDTF?.tradingGovernance?.timelock?.id as Address
  const voteTokenAddress = indexDTF?.stToken?.id as Address

  const { data, loading, error, isReady, handleSimulation, resetSimulation } =
    useProposalSimulation(
      governorAddress,
      timelockAddress,
      voteTokenAddress,
      chainId
    )

  // Track last simulated calldatas to detect changes
  const lastSimulatedCalldatasRef = useRef<string>('')

  // Auto-trigger simulation when proposal is confirmed and calldatas change
  useEffect(() => {
    if (!isProposalConfirmed || !calldatas || !indexDTF || !isReady) return

    // Serialize calldatas for comparison
    const currentCalldatas = JSON.stringify(calldatas)

    // Only simulate if calldatas have changed or this is the first confirmation
    if (currentCalldatas !== lastSimulatedCalldatasRef.current) {
      // Reset previous simulation state
      resetSimulation()

      // Construct simulation config
      const targets = calldatas.map(() => indexDTF.id as Address)
      const values = calldatas.map(() => 0n)

      const config = {
        targets,
        values,
        calldatas,
        description: 'Proposal Simulation Test', // Mock description for simulation
      }

      // Trigger simulation
      handleSimulation(config)

      // Update ref to track what we just simulated
      lastSimulatedCalldatasRef.current = currentCalldatas
    }
  }, [
    isProposalConfirmed,
    calldatas,
    indexDTF,
    isReady,
    handleSimulation,
    resetSimulation,
  ])

  // Manual simulation trigger (for re-running after auto-simulation)
  const onSimulate = () => {
    if (!calldatas || !indexDTF) return

    const targets = calldatas.map(() => indexDTF.id as Address)
    const values = calldatas.map(() => 0n)

    const config = {
      targets,
      values,
      calldatas,
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
      isReady={isReady && !!calldatas}
    />
  )
}

const BasketProposalOverview = () => {
  const isProposalConfirmed = useAtomValue(isProposalConfirmedAtom)

  return (
    <div className="flex flex-col gap-2">
      <div
        className={
          !isProposalConfirmed
            ? 'border-4 overflow-hidden w-full border-secondary rounded-3xl bg-background h-[fit-content] sticky top-0'
            : 'border-4 overflow-hidden w-full border-secondary rounded-3xl bg-background h-[fit-content]'
        }
      >
        <Header />
        <ProposalInstructions />
      </div>
      <SimulateProposalCard />
    </div>
  )
}

export default BasketProposalOverview
