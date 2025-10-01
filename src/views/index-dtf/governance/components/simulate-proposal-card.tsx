import useProposalSimulation from '@/hooks/use-proposal-simulation'
import { useEffect, useRef } from 'react'
import { Address } from 'viem'
import SimulateProposal from './simulate-proposal'

interface SimulateProposalCardProps {
  isProposalConfirmed: boolean
  proposalData: {
    targets: readonly Address[]
    values: readonly bigint[]
    calldatas: readonly `0x${string}`[]
  } | null
  governorAddress: Address
  timelockAddress: Address
  voteTokenAddress: Address
  chainId: number
}

/**
 * Reusable component for simulating governance proposals
 *
 * Automatically triggers simulation when:
 * - Proposal is confirmed
 * - Proposal data changes (detected via JSON comparison)
 * - Simulation dependencies are ready
 *
 * Also provides manual re-trigger button for re-running simulations
 */
const SimulateProposalCard = ({
  isProposalConfirmed,
  proposalData,
  governorAddress,
  timelockAddress,
  voteTokenAddress,
  chainId,
}: SimulateProposalCardProps) => {
  const { data, loading, error, isReady, handleSimulation, resetSimulation } =
    useProposalSimulation(
      governorAddress,
      timelockAddress,
      voteTokenAddress,
      chainId
    )

  // Track last simulated data to detect changes
  const lastSimulatedDataRef = useRef<string>('')

  // Auto-trigger simulation when proposal is confirmed and data changes
  useEffect(() => {
    if (!isProposalConfirmed || !proposalData || !isReady) return

    // Serialize proposal data for comparison
    const currentData = JSON.stringify({
      targets: proposalData.targets,
      values: proposalData.values.map((v) => v.toString()), // Convert bigints to strings for JSON
      calldatas: proposalData.calldatas,
    })

    // Only simulate if proposal data has changed
    if (currentData !== lastSimulatedDataRef.current) {
      // Reset previous simulation state
      resetSimulation()

      // Construct simulation config
      const config = {
        targets: proposalData.targets as Address[],
        values: proposalData.values as bigint[],
        calldatas: proposalData.calldatas as `0x${string}`[],
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
      targets: proposalData.targets as Address[],
      values: proposalData.values as bigint[],
      calldatas: proposalData.calldatas as `0x${string}`[],
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

export default SimulateProposalCard
