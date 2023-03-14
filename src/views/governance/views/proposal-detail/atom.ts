import { atom } from 'jotai'

export interface ProposalDetail {
  id: string
  description: string
  creationTime: string
  state: string
  calldatas: string[]
  targets: string[]
  proposer: string
}

export const proposalDetailAtom = atom<null | ProposalDetail>(null)
