import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
  indexDTFVersionAtom,
} from '@/state/dtf/atoms'
import { DecodedCalldata } from '@/types'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { atom, useAtomValue } from 'jotai'
import { ArrowUpRightIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Address, Hex } from 'viem'
import RawCallPreview from '../raw-call-preview'
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

export const isSingletonRebalanceAtom = atom((get) => {
  const version = get(indexDTFVersionAtom)
  // return checkVersion('4.0.0', version)
  return true
})

// Rebalance proposal preview for 4.0 indexes
const RebalancePreview = ({ calldatas }: { calldatas: Hex[] | undefined }) => {
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const shares = useAtomValue(indexDTFBasketSharesAtom)
  const prices = useAtomValue(indexDTFBasketPricesAtom)
  const isSingletonRebalance = useAtomValue(isSingletonRebalanceAtom)

  // TODO: Better loading skeleton!
  if (!dtf || !basket || !prices || !calldatas?.length)
    return <Skeleton className="h-80" />

  // @deprecated - old rebalance flow
  if (!isSingletonRebalance) {
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
        {/* <div className="p-4">
          <h4 className="text-primary text-lg font-semibold mb-2">1/1</h4>
          <RawCallPreview call={calldatas[0]} />
        </div> */}
      </TabsContent>
    </Tabs>
  )
}

export default RebalancePreview
