import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
import { atom } from 'jotai'

// TODO: Going away in favor of using the hook directly
export const governanceProposalsAtom = atom<
  readonly IndexDtfProposalSummary[] | undefined
>(undefined)
export const proposalCountAtom = atom<number | undefined>(undefined)

export const refetchTokenAtom = atom(0)
