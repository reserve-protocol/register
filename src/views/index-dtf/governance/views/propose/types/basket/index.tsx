import { Token } from '@/types'
import { atom } from 'jotai'

interface IndexAssetShares {
  token: Token
  currentShares: string
  proposedShares: string
}

const proposedIndexBasketAtom = atom<
  Record<string, IndexAssetShares> | undefined
>(undefined)

const ProposalContainer = () => {
  return <div className="bg-secondary rounded-3xl"></div>
}

// TODO: A lot of these components could be shared, don't worry at this point
const IndexDTFBasketProposal = () => {
  return <div className="grid grid-cols-2"></div>
}

export default IndexDTFBasketProposal
