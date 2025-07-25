import { encodeFunctionData, parseEther } from 'viem'
import dtfGovernanceAbi from '@/abis/dtf-index-governance'
import timelockAbi from '@/abis/Timelock'
import { GovernanceChanges, PERCENTAGE_CONSTANTS } from '../types'

/**
 * Encode voting delay change
 */
export const encodeVotingDelay = (seconds: number) => {
  return encodeFunctionData({
    abi: dtfGovernanceAbi,
    functionName: 'setVotingDelay',
    args: [seconds],
  })
}

/**
 * Encode voting period change
 */
export const encodeVotingPeriod = (seconds: number) => {
  return encodeFunctionData({
    abi: dtfGovernanceAbi,
    functionName: 'setVotingPeriod',
    args: [seconds],
  })
}

/**
 * Encode proposal threshold change
 * @param percentage - Percentage value (0-100)
 */
export const encodeProposalThreshold = (percentage: number) => {
  // Convert percentage to decimal (0-1) and ensure proper string formatting
  const decimal = percentage / 100
  // Use toFixed to ensure proper decimal formatting and avoid scientific notation
  const formattedDecimal = decimal.toFixed(18)
  
  return encodeFunctionData({
    abi: dtfGovernanceAbi,
    functionName: 'setProposalThreshold',
    args: [parseEther(formattedDecimal)],
  })
}

/**
 * Encode quorum change
 * @param percentage - Percentage value (0-100)
 * @param quorumDenominator - Current quorum denominator from governance (with 18 decimals)
 */
export const encodeQuorum = (percentage: number, quorumDenominator: number) => {
  // Convert percentage to basis points (multiply by 100 to avoid decimals)
  // Example: 0.01% becomes 1, 1% becomes 100, 50.5% becomes 5050
  const percentageInBasisPoints = Math.round(percentage * 100)
  
  // Calculate new numerator: (percentage * denominator) / 100
  // Using basis points: (percentageInBasisPoints * denominator) / 10000
  const newQuorumNumerator = (BigInt(percentageInBasisPoints) * BigInt(quorumDenominator)) / 10000n
  
  return encodeFunctionData({
    abi: dtfGovernanceAbi,
    functionName: 'updateQuorumNumerator',
    args: [newQuorumNumerator],
  })
}

/**
 * Encode execution delay change (timelock)
 */
export const encodeExecutionDelay = (seconds: number) => {
  return encodeFunctionData({
    abi: timelockAbi,
    functionName: 'updateDelay',
    args: [BigInt(seconds)],
  })
}

/**
 * Convert stored proposal threshold to percentage
 * @param threshold - Stored threshold value
 * @returns Percentage (0-100)
 */
export const proposalThresholdToPercentage = (
  threshold: bigint | number
): number => {
  return Number(threshold) / PERCENTAGE_CONSTANTS.PROPOSAL_THRESHOLD_MULTIPLIER
}

/**
 * Check if governance changes object has any changes
 */
export const hasGovernanceChanges = (changes: GovernanceChanges): boolean => {
  return Object.keys(changes).length > 0
}
