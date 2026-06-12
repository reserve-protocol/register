import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
import { atom } from 'jotai'
import type { RecentProposalsMap } from './utils/recent-proposals'

// TODO: Going away in favor of using the hook directly
export const governanceProposalsAtom = atom<
  readonly IndexDtfProposalSummary[] | undefined
>(undefined)
export const proposalCountAtom = atom<number | undefined>(undefined)

export const recentProposalsAtom = atom<RecentProposalsMap>({})

export const refetchTokenAtom = atom(0)
