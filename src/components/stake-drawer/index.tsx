import { useSetAtom, useAtom, useAtomValue } from 'jotai'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { walletAtom } from '@/state/atoms'
import { shortenAddress } from '@/utils'
import { isAddress, zeroAddress } from 'viem'
import {
  Asterisk,
  OctagonAlert,
  Plus,
  Minus,
  Vote,
  Pencil,
  Undo2,
  AlertCircle,
} from 'lucide-react'
import {
  currentStakingTabAtom,
  unstakeCheckboxAtom,
  stTokenAtom,
  stakingInputAtom,
  unstakeDelayAtom,
  closeDrawerAtom,
  currentDelegateAtom,
  delegateAtom,
  isLegacyAtom,
  rsrBalanceAtom,
  stTokenBalanceAtom,
  exchangeRateAtom,
  errorMessageAtom,
  delegationLoadingAtom,
  type StTokenExtended,
  type Token,
  type DTFInfo,
} from './atoms'
import Stake from './components/stake'
import Unstake from './components/unstake'
import SubmitStakeButton from './components/submit-stake-button'
import SubmitUnstakeButton from './components/submit-unstake-button'
import Updater from './updater'

const TABS = [
  {
    key: 'stake',
    label: 'Stake RSR',
    icon: <Plus size={16} />,
  },
  {
    key: 'unstake',
    label: 'Unstake',
    icon: <Minus size={16} />,
  },
]

const UnstakeCheckbox = () => {
  const stToken = useAtomValue(stTokenAtom)
  const delay = useAtomValue(unstakeDelayAtom)
  const [checkbox, setCheckbox] = useAtom(unstakeCheckboxAtom)

  if (!stToken || !delay) return null

  return (
    <label className="flex flex-col gap-2 px-4 py-6 cursor-pointer">
      <OctagonAlert size={16} className="text-warning" />
      <div className="flex items-end gap-2 justify-between">
        <div className="max-w-sm">
          <div className="font-bold">
            I'm aware of the {delay}-day unstake delay
          </div>
          <div className="text-sm text-legend">
            If you decide to unstake in the future, you'll need to wait {delay} days
            until you can complete the withdrawal
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

const UnstakeProcess = () => {
  const stToken = useAtomValue(stTokenAtom)
  const delay = useAtomValue(unstakeDelayAtom)

  if (!stToken || !delay) return null

  return (
    <div className="flex-grow flex flex-col gap-1 items-center justify-center">
      <div className="rounded-full bg-primary p-1 w-max">
        <Asterisk size={20} className="text-white" />
      </div>
      <div className="font-bold mt-3">Unstake process</div>
      <div className="text-primary mt-3">1.</div>
      <div className="text-md max-w-sm text-center -mt-1">
        A {delay}-day unstake delay period begins & you stop accumulating rewards
      </div>
      <div className="text-primary mt-3">2.</div>
      <div className="text-md max-w-sm text-center -mt-1">
        Wait {delay} days
      </div>
      <div className="text-primary mt-3">3.</div>
      <div className="text-md max-w-sm text-center -mt-1">
        Come back to your account balance page to withdraw your unstaked RSR
      </div>
    </div>
  )
}

const ErrorMessage = () => {
  const errorMessage = useAtomValue(errorMessageAtom)

  if (!errorMessage) return null

  return (
    <div className="px-2 mb-3">
      <Alert variant="destructive" className="py-3">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          {errorMessage}
        </AlertDescription>
      </Alert>
    </div>
  )
}

const Delegate = () => {
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const isLegacy = useAtomValue(isLegacyAtom)
  const [currentDelegate, setCurrentDelegate] = useAtom(currentDelegateAtom)
  const [delegate, setDelegate] = useAtom(delegateAtom)
  const [delegateVisible, setDelegateVisible] = useState(false)

  const isValidDelegate = isAddress(delegate, { strict: false })

  // Don't show delegation for legacy contracts
  if (isLegacy) return null

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
        <div className="px-2">
          <Input
            placeholder="Delegate to address"
            value={delegate}
            onChange={(e) => setDelegate(e.target.value)}
            className="rounded-xl bg-card px-4 text-base h-12"
          />
          {!isValidDelegate && delegate && (
            <div className="text-red-700/70 text-sm px-4 py-1">
              Invalid address
            </div>
          )}
        </div>
      )}
    </>
  )
}

const StakeDrawer = ({
  stToken,
  dtf,
  chainId,
  unstakeDelay = 1209600, // 14 days in seconds
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onClose,
  children
}: StakeDrawerProps) => {
  const wallet = useAtomValue(walletAtom)
  const [currentTab, setCurrentTab] = useAtom(currentStakingTabAtom)
  const isStake = currentTab === 'stake'

  const resetInput = useResetAtom(stakingInputAtom)
  const resetCheckbox = useResetAtom(unstakeCheckboxAtom)
  const resetCurrentTab = useResetAtom(currentStakingTabAtom)
  const resetStToken = useResetAtom(stTokenAtom)
  const resetRsrBalance = useResetAtom(rsrBalanceAtom)
  const resetStTokenBalance = useResetAtom(stTokenBalanceAtom)
  const resetExchangeRate = useResetAtom(exchangeRateAtom)
  const resetCurrentDelegate = useResetAtom(currentDelegateAtom)
  const resetDelegate = useResetAtom(delegateAtom)
  const resetIsLegacy = useResetAtom(isLegacyAtom)
  const resetUnstakeDelay = useResetAtom(unstakeDelayAtom)
  const resetErrorMessage = useResetAtom(errorMessageAtom)
  const resetDelegationLoading = useResetAtom(delegationLoadingAtom)

  const setStToken = useSetAtom(stTokenAtom)
  const setUnstakeDelay = useSetAtom(unstakeDelayAtom)
  const [shouldClose, setShouldClose] = useAtom(closeDrawerAtom)

  // Default state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(false)

  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen! : internalOpen
  const onOpenChange = isControlled ? controlledOnOpenChange! : setInternalOpen

  // Helper function to reset all atoms
  const resetAllAtoms = () => {
    resetCurrentTab()
    resetInput()
    resetCheckbox()
    resetStToken()
    resetRsrBalance()
    resetStTokenBalance()
    resetExchangeRate()
    resetCurrentDelegate()
    resetDelegate()
    resetIsLegacy()
    resetUnstakeDelay()
    resetErrorMessage()
    resetDelegationLoading()
  }

  // Reset atoms when drawer opens and set up stToken
  useEffect(() => {
    if (open && stToken) {
      // Only reset UI atoms when opening (preserve delegate and other data)
      resetInput()
      resetCheckbox()
      resetCurrentTab()

      // Then set the new stToken
      const stTokenExtended: StTokenExtended = {
        stToken,
        dtf,
        chainId,
      }
      setStToken(stTokenExtended)

      // Set unstake delay
      setUnstakeDelay(unstakeDelay / 86400)
    }
  }, [open, stToken, dtf, chainId, unstakeDelay])

  // Handle close trigger from child components
  useEffect(() => {
    if (shouldClose) {
      resetAllAtoms()
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
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            resetAllAtoms()
          }
          onOpenChange(newOpen)
        }}
        onClose={() => {
          resetAllAtoms()
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
              setCurrentTab(tab as 'stake' | 'unstake')
              resetInput()
              resetCheckbox()
              resetErrorMessage()
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
            <TabsContent value="stake" className="h-full overflow-auto p-2 mt-0">
              <Stake />
            </TabsContent>
            <TabsContent value="unstake" className="overflow-auto p-2 mt-0">
              <Unstake />
            </TabsContent>
          </Tabs>
          <DrawerFooter className="flex-grow justify-end mb-2">
            <div>
              {isStake ? <UnstakeCheckbox /> : <UnstakeProcess />}
              {isStake && <Delegate />}
            </div>
            <ErrorMessage />
            {isStake ? (
              <SubmitStakeButton />
            ) : (
              <SubmitUnstakeButton />
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Updater />
    </>
  )
}

export interface StakeDrawerProps {
  stToken: Token
  dtf: DTFInfo
  chainId: number
  unstakeDelay?: number // in seconds, defaults to 14 days
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  children?: ReactNode
}

export default StakeDrawer