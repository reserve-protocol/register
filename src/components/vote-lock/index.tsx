import { Provider as AtomProvider, useSetAtom, useAtom, useAtomValue } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { ReactNode, useEffect, useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { walletAtom } from '@/state/atoms'
import { shortenAddress } from '@/utils'
import { isAddress, zeroAddress } from 'viem'
import {
  Asterisk,
  LockKeyhole,
  LockKeyholeOpen,
  OctagonAlert,
  Pencil,
  Undo2,
  Vote,
} from 'lucide-react'
import {
  currentDelegateAtom,
  currentStakingTabAtom,
  delegateAtom,
  lockCheckboxAtom,
  stTokenAtom,
  stakingInputAtom,
  unlockDelayAtom,
  closeDrawerAtom,
  type StTokenExtended,
} from './atoms'
import VoteLock from './components/vote-lock'
import VoteUnlock from './components/vote-unlock'
import SubmitLockButton, { DelegateButton } from './components/submit-lock-button'
import SubmitUnlockButton from './components/submit-unlock-button'
import Updater from './updater'

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
  const [currentDelegate, setCurrentDelegate] = useAtom(currentDelegateAtom)
  const [delegate, setDelegate] = useAtom(delegateAtom)
  const [delegateVisible, setDelegateVisible] = useState(false)

  const isValidDelegate = isAddress(delegate, { strict: false })

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
                const delegateOrSelf = currentDelegate || account || ''
                setDelegate(delegateOrSelf)
                setDelegateVisible(true)
              }}
            >
              <div>
                {currentDelegate && currentDelegate !== zeroAddress
                  ? shortenAddress(currentDelegate)
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

const VoteLockDrawerInner = ({
  stToken,
  unlockDelay = 604800, // 7 days in seconds
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onClose,
  children
}: VoteLockDrawerProps) => {
  const wallet = useAtomValue(walletAtom)
  const [currentTab, setCurrentTab] = useAtom(currentStakingTabAtom)
  const delegate = useAtomValue(delegateAtom)
  const currentDelegate = useAtomValue(currentDelegateAtom)
  const isSelfDelegate = delegate === wallet
  const triggerDelegateButton = !isSelfDelegate && delegate !== currentDelegate
  const isLock = currentTab === 'lock'

  const resetInput = useResetAtom(stakingInputAtom)
  const resetCheckbox = useResetAtom(lockCheckboxAtom)
  const resetCurrentTab = useResetAtom(currentStakingTabAtom)

  const setStToken = useSetAtom(stTokenAtom)
  const setUnlockDelay = useSetAtom(unlockDelayAtom)
  const [shouldClose, setShouldClose] = useAtom(closeDrawerAtom)

  // Default state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(true)

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen! : internalOpen
  const onOpenChange = isControlled ? controlledOnOpenChange! : setInternalOpen

  useEffect(() => {
    if (stToken) {
      setStToken(stToken)
    }
  }, [stToken, setStToken])

  useEffect(() => {
    // Convert seconds to days
    setUnlockDelay(unlockDelay / 86400)
  }, [unlockDelay, setUnlockDelay])

  // Handle close trigger from child components
  useEffect(() => {
    if (shouldClose) {
      onOpenChange(false)
      if (onClose) {
        onClose()
      }
      setShouldClose(false)
    }
  }, [shouldClose, onOpenChange, onClose, setShouldClose])

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        onClose={() => {
          resetCurrentTab()
          resetInput()
          resetCheckbox()
          onOpenChange(false)
        }}
      >
        {!!children && (
          <DrawerTrigger
            asChild
            onClick={() => onOpenChange(true)}
          >
            {children}
          </DrawerTrigger>
        )}
        <DrawerContent>
          <Tabs
            value={currentTab}
            onValueChange={(tab) => {
              setCurrentTab(tab as 'lock' | 'unlock')
              resetInput()
              resetCheckbox()
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
            <TabsContent value="lock" className="h-full overflow-auto p-2 mt-0">
              <VoteLock />
            </TabsContent>
            <TabsContent value="unlock" className="overflow-auto p-2 mt-0">
              <VoteUnlock />
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
      <Updater />
    </>
  )
}

export interface VoteLockDrawerProps {
  stToken: StTokenExtended
  unlockDelay?: number // in seconds, defaults to 7 days
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  children?: ReactNode
}

const VoteLockDrawer = (props: VoteLockDrawerProps) => {
  return (
    <AtomProvider>
      <VoteLockDrawerInner {...props} />
    </AtomProvider>
  )
}

export default VoteLockDrawer
export { type StTokenExtended }