import { atom } from 'jotai'

export type ProposalType = 'standard' | 'optimistic'

export const proposalTypeAtom = atom<ProposalType>('standard')
