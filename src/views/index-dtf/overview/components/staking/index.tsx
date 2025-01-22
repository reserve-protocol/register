import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAssetPrice } from '@/hooks/useAssetPrices'
import useERC20Balance from '@/hooks/useERC20Balance'
import { useWatchReadContract } from '@/hooks/useWatchReadContract'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Minus, OctagonAlert, Plus } from 'lucide-react'
import { ReactNode, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import {
  currentStakingTabAtom,
  lockCheckboxAtom,
  stakingInputAtom,
  underlyingBalanceAtom,
  underlyingStTokenPriceAtom,
  unlockBalanceRawAtom,
  unlockDelayAtom,
} from './atoms'
import LockView from './lock'
import SubmitLockButton from './lock/submit-lock-button'
import SubmitUnlockButton from './unlock/submit-unlock-button copy'
import UnlockView from './unlock'
import { Checkbox } from '@/components/ui/checkbox'

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

const LockCheckbox = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const delay = useAtomValue(unlockDelayAtom)
  const [checkbox, setCheckbox] = useAtom(lockCheckboxAtom)

  if (!indexDTF?.stToken || !delay) return null

  return (
    <label className="flex flex-col gap-2 p-4 cursor-pointer">
      <OctagonAlert size={16} className="text-warning" />
      <div className="flex items-end gap-2 justify-between">
        <div className="max-w-sm">
          <div className="font-bold">
            I’m aware of the {delay}-day unlock delay
          </div>
          <div className="text-sm text-legend">
            If you decide to unlock {indexDTF.stToken.underlying.symbol} in the
            future, you’ll need to wait {delay} days until you can complete the
            withdrawal
          </div>
        </div>
        <div className="flex items-center p-[6px] border border-border rounded-lg">
          <Checkbox
            checked={checkbox}
            onCheckedChange={(checked: boolean) => setCheckbox(checked)}
          />
        </div>
      </div>
    </label>
  )
}

const Staking = ({ children }: { children: ReactNode }) => {
  const wallet = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const [currentTab, setCurrentTab] = useAtom(currentStakingTabAtom)
  const isLock = currentTab === 'lock'
  const setInput = useSetAtom(stakingInputAtom)
  const setUnderlyingPrice = useSetAtom(underlyingStTokenPriceAtom)
  const setUnderlyingBalance = useSetAtom(underlyingBalanceAtom)
  const setUnlockBalanceRaw = useSetAtom(unlockBalanceRawAtom)
  const setUnlockDelay = useSetAtom(unlockDelayAtom)
  const setCheckbox = useSetAtom(lockCheckboxAtom)

  const { data: priceResponse } = useAssetPrice(
    indexDTF?.stToken?.underlying.address
  )

  const { data: balance } = useERC20Balance(
    indexDTF?.stToken?.underlying.address
  )

  const { data: unlockBalanceRaw } = useWatchReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'maxWithdraw',
    address: indexDTF?.stToken?.id,
    args: [wallet!],
    query: { enabled: !!wallet },
  })

  const { data: delay } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'unstakingDelay',
    address: indexDTF?.stToken?.id,
    args: [],
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

  useEffect(() => {
    setUnlockDelay(delay ? Number(delay) / 86400 : undefined)
  }, [delay, setUnlockDelay])

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <Tabs
          value={currentTab}
          onValueChange={(tab) => {
            setCurrentTab(tab as 'lock' | 'unlock')
            setInput('')
            setCheckbox(false)
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
          <TabsContent value="lock" className="h-full overflow-auto  p-2 mt-0">
            <LockView />
          </TabsContent>
          <TabsContent value="unlock" className="overflow-auto p-2 mt-0">
            <UnlockView />
          </TabsContent>
        </Tabs>
        <DrawerFooter className="mb-2">
          {isLock && <LockCheckbox />}
          {isLock ? <SubmitLockButton /> : <SubmitUnlockButton />}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default Staking
