import {
  Drawer,
  DrawerContent,
  DrawerFooter,
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
  zapMintInputAtom,
} from './atom'
import Buy from './buy'
import Sell from './sell'

const ZapMint = ({ children }: { children: ReactNode }) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const [currentTab, setCurrentTab] = useAtom(currentZapMintTabAtom)
  const isBuy = currentTab === 'buy'
  const setInput = useSetAtom(zapMintInputAtom)
  const setIndexDTFBalance = useSetAtom(indexDTFBalanceAtom)

  const { data: balance } = useERC20Balance(indexDTF?.id)

  useEffect(() => {
    setIndexDTFBalance(balance || 0n)
  }, [balance, setIndexDTFBalance])

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <Tabs
          value={currentTab}
          onValueChange={(tab) => {
            setCurrentTab(tab as 'buy' | 'sell')
            setInput('')
          }}
          className="flex flex-col"
        >
          <DrawerTitle className="flex gap-2 mt-2 px-2 mb-2">
            <TabsList className="h-9">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>
          </DrawerTitle>
          <TabsContent value="buy" className="h-full overflow-auto px-2 mt-0">
            <Buy />
          </TabsContent>
          <TabsContent value="sell" className="overflow-auto px-2 mt-0">
            <Sell />
          </TabsContent>
        </Tabs>
        <DrawerFooter className="flex-grow justify-end mb-2">
          {/* {isBuy ? <SubmitLockButton /> : <SubmitUnlockButton />} */}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ZapMint
