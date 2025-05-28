import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useRebalanceBasketPreview from '@/hooks/use-rebalance-basket-preview'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
  isSingletonRebalanceAtom,
} from '@/state/dtf/atoms'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Address, Hex } from 'viem'
import { RawCallsPreview } from '../raw-call-preview'
import BasketProposalPreview from './legacy-basket-proposal-preview'

const TABS = {
  SUMMARY: 'summary',
  RAW: 'raw',
}

const Header = ({ address }: { address: Address }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="mx-4 py-4 flex items-center flex-wrap gap-2 border-b">
      <h1 className="text-xl font-bold text-primary">Basket Change</h1>
      <Link
        target="_blank"
        className="mr-auto"
        to={getExplorerLink(address, chainId, ExplorerDataType.ADDRESS)}
      >
        <Button
          size="icon-rounded"
          className="bg-primary/10 text-primary h-6 w-6 p-0 hover:text-white"
        >
          <ArrowUpRightIcon size={18} strokeWidth={1.5} />
        </Button>
      </Link>

      <TabsList className="h-9">
        <TabsTrigger value={TABS.SUMMARY} className="w-max h-7">
          Summary
        </TabsTrigger>

        <TabsTrigger value={TABS.RAW} className="w-max h-7">
          Raw
        </TabsTrigger>
      </TabsList>
    </div>
  )
}

const RebalancePreview = ({
  calldatas,
  timestamp,
}: {
  calldatas: Hex[] | undefined
  timestamp?: number
}) => {
  const dtf = useAtomValue(indexDTFAtom)
  const rebalanceBasketPreview = useRebalanceBasketPreview(calldatas, timestamp)

  // TODO: Better loading skeleton!
  if (!dtf || !rebalanceBasketPreview) return <Skeleton className="h-80" />

  return (
    <Tabs
      defaultValue="basket"
      className="flex flex-col gap-4 p-2 pt-4 rounded-3xl bg-background"
    >
      <Header address={dtf.id.toLowerCase() as Address} />
      <TabsContent className="m-0" value={TABS.SUMMARY}>
        summary
      </TabsContent>
      <TabsContent className="m-0" value={TABS.RAW}>
        <RawCallsPreview calls={[rebalanceBasketPreview.decodedCalldata]} />
      </TabsContent>
    </Tabs>
  )
}

const LegacyRebalancePreview = ({
  calldatas,
}: {
  calldatas: Hex[] | undefined
}) => {
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const shares = useAtomValue(indexDTFBasketSharesAtom)
  const prices = useAtomValue(indexDTFBasketPricesAtom)

  if (!dtf || !basket || !prices || !calldatas?.length)
    return <Skeleton className="h-80" />

  return (
    <BasketProposalPreview
      calldatas={calldatas}
      basket={basket}
      shares={shares}
      prices={prices}
      address={dtf.id.toLowerCase() as Address}
    />
  )
}

export default ({
  calldatas,
  timestamp,
}: {
  calldatas: Hex[] | undefined
  timestamp?: number
}) => {
  const isSingletonRebalance = useAtomValue(isSingletonRebalanceAtom)

  if (!isSingletonRebalance) {
    return <LegacyRebalancePreview calldatas={calldatas} />
  }

  return <RebalancePreview calldatas={calldatas} timestamp={timestamp} />
}
