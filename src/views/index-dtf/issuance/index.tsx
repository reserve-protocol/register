import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useERC20Balance from '@/hooks/useERC20Balance'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  currentZapMintTabAtom,
  indexDTFBalanceAtom,
  zapFetchingAtom,
  zapMintInputAtom,
  zapOngoingTxAtom,
  zapRefetchAtom,
} from '../overview/components/zap-mint/atom'
import Buy from '../overview/components/zap-mint/buy'
import RefreshQuote from '../overview/components/zap-mint/refresh-quote'
import Sell from '../overview/components/zap-mint/sell'

const IndexDTFIssuance = () => {
  const [currentTab, setCurrentTab] = useAtom(currentZapMintTabAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const zapRefetch = useAtomValue(zapRefetchAtom)
  const zapFetching = useAtomValue(zapFetchingAtom)
  const zapOngoingTx = useAtomValue(zapOngoingTxAtom)
  const setInput = useSetAtom(zapMintInputAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)

  const { data: balance } = useERC20Balance(indexDTF?.id)

  useEffect(() => {
    setIndexDTFBalance(balance || 0n)
  }, [balance, setIndexDTFBalance])

  if (!indexDTF) return null

  return (
    <div className="flex flex-col flex-grow max-w-2xl h-[500px] bg-card rounded-xl p-2 border border-border mx-auto">
      <Tabs
        value={currentTab}
        onValueChange={(tab) => {
          setCurrentTab(tab as 'buy' | 'sell')
          setInput('')
        }}
        className="flex flex-col flex-grow"
      >
        <div className="flex justify-between gap-2 mt-2 px-2 mb-2">
          <TabsList className="h-9">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <RefreshQuote
            onClick={zapRefetch.fn}
            disabled={zapFetching || zapOngoingTx}
          />
        </div>
        <TabsContent
          value="buy"
          className="flex-grow overflow-auto relative px-2 mt-0"
          // Prevent the drawer from closing when clicking on the content
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Buy />
        </TabsContent>
        <TabsContent
          value="sell"
          className="flex-grow overflow-auto relative px-2 mt-0"
          // Prevent the drawer from closing when clicking on the content
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Sell />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IndexDTFIssuance
