import { CHAIN_TO_NETWORK, ROUTES } from '@/utils/constants'
import { ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/utils'
import { accountTokenPricesAtom } from '../../atoms'
import { useAtomValue } from 'jotai'
import { Address } from 'viem'

export const NavigateTo = ({ src }: { src: string }) => {
  return (
    <a href={src} className="text-primary">
      <ChevronRight className="h-4 w-4" />
    </a>
  )
}

export const StakeRSRAction = ({
  yieldDTFChainId,
  yieldDTFAddress,
}: {
  yieldDTFChainId: number
  yieldDTFAddress: string
}) => {
  return (
    <NavigateTo
      src={`/${CHAIN_TO_NETWORK[yieldDTFChainId]}/token/${yieldDTFAddress}/${ROUTES.STAKING}`}
    />
  )
}

export const YieldDTFAction = ({
  yieldDTFChainId,
  yieldDTFAddress,
  yieldDTFUsdPrice,
}: {
  yieldDTFChainId: number
  yieldDTFAddress: string
  yieldDTFUsdPrice: number
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">
        <span className="text-muted-foreground">Price</span> $
        {formatCurrency(yieldDTFUsdPrice)}
      </div>
      <NavigateTo
        src={`/${CHAIN_TO_NETWORK[yieldDTFChainId]}/token/${yieldDTFAddress}/${ROUTES.OVERVIEW}`}
      />
    </div>
  )
}

export const IndexDTFAction = ({
  indexDTFChainId,
  indexDTFAddress,
}: {
  indexDTFChainId: number
  indexDTFAddress: Address
}) => {
  const prices = useAtomValue(accountTokenPricesAtom)
  const indexDTFUsdPrice = prices[indexDTFAddress] || 0

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm">
        <span className="text-muted-foreground">Price</span> $
        {formatCurrency(indexDTFUsdPrice)}
      </div>
      <NavigateTo
        src={`/${indexDTFChainId}/index-dtf/${indexDTFAddress}/${ROUTES.OVERVIEW}`}
      />
    </div>
  )
}
