import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useERC20Balance from '@/hooks/useERC20Balance'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect } from 'react'
import {
  currentZapMintTabAtom,
  indexDTFBalanceAtom,
  zapFetchingAtom,
  zapMintInputAtom,
  zapOngoingTxAtom,
  zapRefetchAtom,
} from './atom'
import Buy from './buy'
import Sell from './sell'
import RefreshQuote from './refresh-quote'
import { manualOperationsSwitchAtom } from '../manual-ops/atoms'
import { ManualOpsSwitch } from '../manual-ops/manual-ops-switch'
import ManualRedeem from '../manual-ops/manual-redeem'

const ZapMint = ({ children }: { children: ReactNode }) => {
  const [currentTab, setCurrentTab] = useAtom(currentZapMintTabAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const zapRefetch = useAtomValue(zapRefetchAtom)
  const zapFetching = useAtomValue(zapFetchingAtom)
  const zapOngoingTx = useAtomValue(zapOngoingTxAtom)
  const setInput = useSetAtom(zapMintInputAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)
  const [manual, setManual] = useAtom(manualOperationsSwitchAtom)

  const { data: balance } = useERC20Balance(indexDTF?.id)

  useEffect(() => {
    setIndexDTFBalance(balance || 0n)
  }, [balance, setIndexDTFBalance])

  if (!indexDTF) return null

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="flex-grow">
        <Tabs
          value={currentTab}
          onValueChange={(tab) => {
            setCurrentTab(tab as 'buy' | 'sell')
            setInput('')
          }}
          className="flex flex-col flex-grow"
        >
          <DrawerTitle className="flex justify-between gap-2 mt-2 px-2 mb-2">
            <TabsList className="h-9">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-1 mr-11">
              {currentTab === 'sell' && (
                <ManualOpsSwitch
                  label="Manual Redeem"
                  checked={manual}
                  onCheckedChange={(c) => setManual(c)}
                />
              )}
              {!manual && (
                <RefreshQuote
                  onClick={zapRefetch.fn}
                  disabled={zapFetching || zapOngoingTx}
                />
              )}
            </div>
          </DrawerTitle>
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
            {manual ? <ManualRedeem /> : <Sell />}
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  )
}

export default ZapMint
