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
  return encodeFunctionData({
    abi: dtfGovernanceAbi,
    functionName: 'setProposalThreshold',
    args: [parseEther((percentage / 100).toString())],
  })
}

/**
 * Encode quorum change
 * @param percentage - Percentage value (0-100)
 */
export const encodeQuorum = (percentage: number) => {
  return encodeFunctionData({
    abi: dtfGovernanceAbi,
    functionName: 'updateQuorumNumerator',
    args: [BigInt(percentage)],
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
