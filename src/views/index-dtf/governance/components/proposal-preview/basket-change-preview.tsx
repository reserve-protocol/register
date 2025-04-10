import { DecodedCalldata } from "@/types"
import BasketProposalPreview from "../../views/propose/basket/components/proposal-basket-preview"

const BasketChangePreview = ({ decodedCalldata }: { decodedCalldata: DecodedCalldata }) => {
  const proposal = useAtomValue(proposalDetailAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const shares = useAtomValue(indexDTFBasketSharesAtom)
  const prices = useAtomValue(indexDTFBasketPricesAtom)

  if (!proposal || !dtf) return <Skeleton className="h-80" />

  if (
    proposal.governor.toLowerCase() !== dtf.tradingGovernance?.id.toLowerCase()
  ) {
    return <div className="text-legend text-center py-8">Coming soon...</div>
  }

  return (
    <BasketProposalPreview
      calldatas={proposal.calldatas}
      basket={basket}
      shares={shares}
      prices={prices}
      address={dtf.id.toLowerCase() as Address}
    />
  )
}

export default BasketChangePreview