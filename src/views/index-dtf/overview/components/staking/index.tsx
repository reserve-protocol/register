import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import Swap from '@/components/ui/swap'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAssetPrice } from '@/hooks/useAssetPrices'
import useERC20Balance from '@/hooks/useERC20Balance'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Minus, Plus } from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import {
  currentStakingTabAtom,
  inputBalanceAtom,
  inputPriceAtom,
  stakingInputAtom,
  underlyingBalanceAtom,
  underlyingStTokenPriceAtom,
  unlockBalanceAtom,
  unlockBalanceRawAtom,
} from './atoms'
import SubmitStakeButton from './submit-stake-button'
import { useReadContract } from 'wagmi'
import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import { walletAtom } from '@/state/atoms'

const TABS = [
  {
    key: 'lock',
    label: 'Vote lock',
    icon: <Plus size={16} />,
  },
  {
    key: 'unlock',
    label: 'Unlock',
    icon: <Minus size={16} />,
  },
]

const Staking = ({ children }: { children: ReactNode }) => {
  const wallet = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const [currentTab, setCurrentTab] = useAtom(currentStakingTabAtom)
  const [input, onChange] = useAtom(stakingInputAtom)
  const inputPrice = useAtomValue(inputPriceAtom)
  const inputBalance = useAtomValue(inputBalanceAtom)
  const unlockBalance = useAtomValue(unlockBalanceAtom)
  const setUnderlyingPrice = useSetAtom(underlyingStTokenPriceAtom)
  const setUnderlyingBalance = useSetAtom(underlyingBalanceAtom)
  const setUnlockBalanceRaw = useSetAtom(unlockBalanceRawAtom)

  const { data: priceResponse } = useAssetPrice(
    indexDTF?.stToken?.underlying.address
  )

  const { data: balance } = useERC20Balance(
    indexDTF?.stToken?.underlying.address
  )

  const { data: unlockBalanceRaw } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'maxWithdraw',
    address: indexDTF?.stToken?.id,
    args: [wallet!],
    query: { enabled: !!wallet },
  })

  useEffect(() => {
    setUnderlyingPrice(priceResponse?.[0]?.price)
  }, [priceResponse, setUnderlyingPrice])

  useEffect(() => {
    setUnderlyingBalance(balance)
  }, [balance, setUnderlyingBalance])

  useEffect(() => {
    setUnlockBalanceRaw(unlockBalanceRaw)
  }, [unlockBalanceRaw, setUnlockBalanceRaw])

  const onMax = () => {
    onChange(currentTab === 'lock' ? inputBalance : unlockBalance)
  }

  if (!indexDTF || !indexDTF.stToken) {
    return null
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <Tabs
          value={currentTab}
          onValueChange={(tab) => {
            setCurrentTab(tab as 'lock' | 'unlock')
            onChange('')
          }}
          className="flex flex-col flex-grow overflow-hidden relative"
        >
          <DrawerTitle className="flex gap-2 mt-2 px-2 mb-2">
            <TabsList className="h-9">
              {TABS.map(({ key, label, icon }) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex gap-1 items-center pl-2 pr-3 data-[state=active]:text-primary"
                >
                  {icon}
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </DrawerTitle>
          <TabsContent
            value="lock"
            className="flex-grow overflow-auto p-2 mt-0"
          >
            <Swap
              from={{
                title: 'You lock:',
                address: indexDTF.stToken.underlying.address,
                symbol: indexDTF.stToken.underlying.symbol,
                value: input,
                onChange,
                price: `$${formatCurrency(inputPrice)}`,
                balance: `${formatCurrency(Number(inputBalance))}`,
                onMax,
              }}
              to={{
                address: indexDTF.stToken.id,
                symbol: indexDTF.stToken.token.symbol,
                price: `$${formatCurrency(inputPrice)}`,
                value: input,
              }}
            />
          </TabsContent>
          <TabsContent value="unlock" className="overflow-auto p-2 mt-0">
            <Swap
              from={{
                title: 'You unlock:',
                address: indexDTF.stToken.id,
                symbol: indexDTF.stToken.token.symbol,
                value: input,
                onChange,
                price: `$${formatCurrency(inputPrice)}`,
                balance: `${formatCurrency(Number(unlockBalance))}`,
                onMax,
              }}
              to={{
                address: indexDTF.stToken.underlying.address,
                symbol: indexDTF.stToken.underlying.symbol,
                price: `$${formatCurrency(inputPrice)}`,
                value: input,
              }}
            />
          </TabsContent>
        </Tabs>
        <DrawerFooter>
          <SubmitStakeButton />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default Staking
