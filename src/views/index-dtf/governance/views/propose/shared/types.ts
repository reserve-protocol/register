import { Address, Hex } from 'viem'

/**
 * Common governance parameter changes interface
 * All time values are stored in seconds
 * All percentages are stored as numbers (0-100)
 */
export interface GovernanceChanges {
  votingDelay?: number      // seconds
  votingPeriod?: number     // seconds
  proposalThreshold?: number // percentage (0-100)
  quorumPercent?: number    // percentage (0-100)
  executionDelay?: number   // seconds
}

/**
 * Proposal data structure for contract submission
 */
export interface ProposalData {
  calldatas: Hex[]
  targets: Address[]
}

/**
 * Display format for governance changes
 */
export interface GovernanceChangeDisplay {
  key: keyof GovernanceChanges
  title: string
  current: string
  new: string
}

/**
 * Form field prefixes for different proposal types
 */
export enum FormFieldPrefix {
  BASKET = 'basket',
  DAO = 'dao',
  GOVERNANCE = 'governance', // DTF settings
}

/**
 * Governance context types
 */
export enum GovernanceContext {
  OWNER = 'ownerGovernance',      // DTF Settings
  STAKING = 'stToken.governance',  // DAO Settings
  TRADING = 'tradingGovernance',   // Basket Settings
}

/**
 * Time constants
 */
export const TIME_CONSTANTS = {
  SECONDS_PER_DAY: 86400,
  SECONDS_PER_HOUR: 3600,
  SECONDS_PER_MINUTE: 60,
} as const

/**
 * Percentage encoding constants
 */
export const PERCENTAGE_CONSTANTS = {
  PROPOSAL_THRESHOLD_MULTIPLIER: 1e18, // 1% = 1e18
  PROPOSAL_THRESHOLD_DIVISOR: 1e16,    // For some contracts, 1% = 1e16
} as const