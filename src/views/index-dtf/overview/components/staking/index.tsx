import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ROUTES } from '@/utils/constants'
import { useTrackIndexDTFClick } from '@/views/index-dtf/hooks/useTrackIndexDTFPage'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import {
  Asterisk,
  LockKeyhole,
  LockKeyholeOpen,
  OctagonAlert,
  Pencil,
  Undo2,
  Vote,
} from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useReadContract } from 'wagmi'
import {
  currentDelegateAtom,
  currentStakingTabAtom,
  delegateAtom,
  lockCheckboxAtom,
  portfolioStTokenAtom,
  stTokenAtom,
  stakingInputAtom,
  stakingSidebarOpenAtom,
  underlyingBalanceAtom,
  underlyingStTokenPriceAtom,
  unlockBalanceRawAtom,
  unlockDelayAtom,
} from './atoms'
import LockView from './lock'
import SubmitLockButton, { DelegateButton } from './lock/submit-lock-button'
import UnlockView from './unlock'
import SubmitUnlockButton from './unlock/submit-unlock-button'
import { shortenAddress } from '@/utils'
import { isAddress, zeroAddress } from 'viem'
import { Input } from '@/components/ui/input'

const TABS = [
  {
    key: 'lock',
    label: 'Vote lock',
    icon: <LockKeyhole size={16} />,
  },
  {
    key: 'unlock',
    label: 'Unlock',
    icon: <LockKeyholeOpen size={16} />,
  },
]

const LockCheckbox = () => {
  const stToken = useAtomValue(stTokenAtom)
  const delay = useAtomValue(unlockDelayAtom)
  const [checkbox, setCheckbox] = useAtom(lockCheckboxAtom)

  if (!stToken || !delay) return null

  return (
    <label className="flex flex-col gap-2 px-4 py-6 cursor-pointer">
      <OctagonAlert size={16} className="text-warning" />
      <div className="flex items-end gap-2 justify-between">
        <div className="max-w-sm">
          <div className="font-bold">
            I'm aware of the {delay}-day unlock delay
          </div>
          <div className="text-sm text-legend">
            If you decide to unlock {stToken.underlying.symbol} in the future,
            you'll need to wait {delay} days until you can complete the
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

const UnlockProcess = () => {
  const stToken = useAtomValue(stTokenAtom)
  const delay = useAtomValue(unlockDelayAtom)

  if (!stToken || !delay) return null

  return (
    <div className="flex-grow flex flex-col gap-1 items-center justify-center">
      <div className="rounded-full bg-primary p-1 w-max">
        <Asterisk size={20} className="text-white" />
      </div>
      <div className="font-bold mt-3">Unlock process</div>
      <div className="text-primary mt-3">1.</div>
      <div className="text-md max-w-sm text-center -mt-1">
        A {delay}-day unlock delay period begins & you stop accumulating rewards
      </div>
      <div className="text-primary mt-3">2.</div>
      <div className="text-md max-w-sm text-center -mt-1">
        Wait {delay} days
      </div>
      <div className="text-primary mt-3">3.</div>
      <div className="text-md max-w-sm text-center -mt-1">
        Come back to your account balance page to withdraw your unlocked{' '}
        {stToken.underlying.symbol}
      </div>
    </div>
  )
}

const Delegate = () => {
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const setCurrentDelegate = useSetAtom(currentDelegateAtom)
  const [delegate, setDelegate] = useAtom(delegateAtom)
  const [delegateVisible, setDelegateVisible] = useState(false)

  const isValidDelegate = isAddress(delegate, { strict: false })

  const { data: delegates } = useWatchReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'delegates',
    address: stToken?.id,
    args: [account!],
    query: { enabled: !!account },
  })

  useEffect(() => {
    const delegateOrSelf =
      delegates && delegates !== zeroAddress ? delegates : (account ?? '')
    setDelegate(delegateOrSelf)
    setCurrentDelegate(delegateOrSelf)
  }, [delegates, account, setDelegate, setCurrentDelegate])

  return (
    <>
      <div className="px-2 border-t border-border">
        <div className="flex gap-2 items-center justify-between px-2 pt-6 pb-4">
          <div className="flex gap-2 items-center">
            <div className="rounded-full border border-black p-1 w-max">
              <Vote size={16} />
            </div>
            <div>Voting Power Delegation</div>
          </div>

          {!delegateVisible ? (
            <div
              className={`flex gap-1.5 items-center text-primary ${
                !account ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              role="button"
              onClick={() => {
                const delegateOrSelf =
                  delegates && delegates !== zeroAddress
                    ? delegates
                    : (account ?? '')
                setDelegate(delegateOrSelf)
                setDelegateVisible(true)
              }}
            >
              <div>
                {delegates && delegates !== zeroAddress
                  ? shortenAddress(delegates)
                  : 'Delegate to self'}
              </div>
              <Pencil size={14} />
            </div>
          ) : (
            <div
              className="flex gap-1.5 items-center text-red-700/70 cursor-pointer"
              role="button"
              onClick={() => setDelegateVisible(false)}
            >
              Revert
              <Undo2 size={14} />
            </div>
          )}
        </div>
      </div>
      {delegateVisible && (
        <div>
          <Input
            placeholder="Delegate to address"
            value={delegate}
            onChange={(e) => setDelegate(e.target.value)}
            className="rounded-xl bg-card px-4 text-base h-12"
          />
          {!isValidDelegate && (
            <div className="text-red-700/70 text-sm px-4 py-1">
              Invalid address
            </div>
          )}
        </div>
      )}
    </>
  )
}
const Staking = ({ children }: { children?: ReactNode }) => {
  const wallet = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const [currentTab, setCurrentTab] = useAtom(currentStakingTabAtom)
  const [open, setOpen] = useAtom(stakingSidebarOpenAtom)
  const delegate = useAtomValue(delegateAtom)
  const currentDelegate = useAtomValue(currentDelegateAtom)
  const isSelfDelegate = delegate === wallet
  const triggerDelegateButton = !isSelfDelegate && delegate !== currentDelegate
  const isLock = currentTab === 'lock'
  const setInput = useSetAtom(stakingInputAtom)
  const setUnderlyingPrice = useSetAtom(underlyingStTokenPriceAtom)
  const setUnderlyingBalance = useSetAtom(underlyingBalanceAtom)
  const setUnlockBalanceRaw = useSetAtom(unlockBalanceRawAtom)
  const setUnlockDelay = useSetAtom(unlockDelayAtom)
  const setCheckbox = useSetAtom(lockCheckboxAtom)
  const resetPortfolioStToken = useResetAtom(portfolioStTokenAtom)

  const { pathname } = useLocation()
  const subpage = pathname.includes(ROUTES.GOVERNANCE)
    ? 'governance'
    : 'overview'

  const { trackClick } = useTrackIndexDTFClick('overview', subpage)

  const { data: priceResponse } = useAssetPrice(stToken?.underlying.address)

  const { data: balance } = useERC20Balance(stToken?.underlying.address)

  const { data: unlockBalanceRaw } = useWatchReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'maxWithdraw',
    address: stToken?.id,
    args: [wallet ?? '0x'],
    query: { enabled: !!wallet },
  })

  const { data: delay } = useReadContract({
    abi: dtfIndexStakingVault,
    functionName: 'unstakingDelay',
    address: stToken?.id,
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
    <Drawer
      open={open}
      onOpenChange={setOpen}
      onClose={() => {
        setCurrentTab('lock')
        setInput('')
        setCheckbox(false)
        setOpen(false)
        resetPortfolioStToken()
      }}
    >
      {!!children && (
        <DrawerTrigger
          asChild
          onClick={() => {
            trackClick('lock_govtoken')
            setOpen(true)
          }}
        >
          {children}
        </DrawerTrigger>
      )}
      <DrawerContent>
        <Tabs
          value={currentTab}
          onValueChange={(tab) => {
            setCurrentTab(tab as 'lock' | 'unlock')
            setInput('')
            setCheckbox(false)
          }}
          className="flex flex-col"
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
        <DrawerFooter className="flex-grow justify-end mb-2">
          <div>
            {isLock ? <LockCheckbox /> : <UnlockProcess />}
            {isLock && <Delegate />}
          </div>
          {isLock ? (
            triggerDelegateButton ? (
              <DelegateButton />
            ) : (
              <SubmitLockButton />
            )
          ) : (
            <SubmitUnlockButton />
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default Staking
