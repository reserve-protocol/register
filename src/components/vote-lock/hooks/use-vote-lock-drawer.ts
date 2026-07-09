import { walletAtom } from '@/state/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect, useRef, useState } from 'react'
import { type Address, zeroAddress } from 'viem'
import {
  closeDrawerAtom,
  currentStakingTabAtom,
  lockCheckboxAtom,
  normalDelegateAtom,
  normalDelegateTouchedAtom,
  optimisticDelegateAtom,
  optimisticDelegateTouchedAtom,
  stakingInputAtom,
  stTokenAtom,
  voteLockStateAtom,
  type StTokenExtended,
  type VoteLockDrawerState,
  type VoteLockTab,
} from '../atoms'

const delegateOrWallet = (
  delegate: Address | null | undefined,
  wallet: Address | null
) => {
  if (delegate && delegate !== zeroAddress) return delegate
  return wallet ?? ''
}

const delegateOrEmpty = (delegate: Address | null | undefined) => {
  if (delegate && delegate !== zeroAddress) return delegate
  return ''
}

export const useVoteLockDrawer = ({
  stToken,
  voteLockState,
  initialTab,
  controlledOpen,
  controlledOnOpenChange,
  onClose,
}: {
  stToken: StTokenExtended
  voteLockState?: VoteLockDrawerState
  initialTab?: VoteLockTab
  controlledOpen?: boolean
  controlledOnOpenChange?: (open: boolean) => void
  onClose?: () => void
}) => {
  const account = useAtomValue(walletAtom)
  const [currentTab, setCurrentTab] = useAtom(currentStakingTabAtom)
  const resetInput = useResetAtom(stakingInputAtom)
  const resetCheckbox = useResetAtom(lockCheckboxAtom)
  const resetNormalDelegateTouched = useResetAtom(normalDelegateTouchedAtom)
  const resetOptimisticDelegateTouched = useResetAtom(
    optimisticDelegateTouchedAtom
  )
  const resetCurrentTab = useResetAtom(currentStakingTabAtom)
  const isNormalDelegateTouched = useAtomValue(normalDelegateTouchedAtom)
  const isOptimisticDelegateTouched = useAtomValue(
    optimisticDelegateTouchedAtom
  )
  const setStToken = useSetAtom(stTokenAtom)
  const setVoteLockState = useSetAtom(voteLockStateAtom)
  const setNormalDelegate = useSetAtom(normalDelegateAtom)
  const setOptimisticDelegate = useSetAtom(optimisticDelegateAtom)
  const [shouldClose, setShouldClose] = useAtom(closeDrawerAtom)
  const [internalOpen, setInternalOpen] = useState(false)
  const wasOpen = useRef(false)
  const isControlled = controlledOpen !== undefined
  const open = controlledOpen ?? internalOpen

  const setOpen = (nextOpen: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(nextOpen)
      return
    }

    setInternalOpen(nextOpen)
  }

  const resetForm = () => {
    resetCurrentTab()
    resetInput()
    resetCheckbox()
    resetNormalDelegateTouched()
    resetOptimisticDelegateTouched()
  }

  const syncDrawerState = () => {
    setStToken(stToken)
    setVoteLockState(voteLockState)

    if (!isNormalDelegateTouched) {
      setNormalDelegate(delegateOrWallet(voteLockState?.delegate, account))
    }

    if (!isOptimisticDelegateTouched) {
      setOptimisticDelegate(delegateOrEmpty(voteLockState?.optimisticDelegate))
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setCurrentTab(initialTab ?? 'lock')
      syncDrawerState()
    }

    setOpen(nextOpen)

    if (!nextOpen) {
      resetForm()
      onClose?.()
    }
  }

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab as VoteLockTab)
    resetInput()
    resetCheckbox()
  }

  useEffect(() => {
    if (!wasOpen.current && open) {
      setCurrentTab(initialTab ?? 'lock')
    }

    wasOpen.current = open
  }, [open, initialTab, setCurrentTab])

  useEffect(() => {
    if (!open) return

    syncDrawerState()
  }, [
    open,
    account,
    stToken,
    voteLockState,
    voteLockState?.delegate,
    voteLockState?.optimisticDelegate,
    isNormalDelegateTouched,
    isOptimisticDelegateTouched,
    setStToken,
    setVoteLockState,
    setNormalDelegate,
    setOptimisticDelegate,
  ])

  useEffect(() => {
    if (!shouldClose) return

    handleOpenChange(false)
    setShouldClose(false)
  }, [shouldClose, setShouldClose])

  return {
    currentTab,
    open,
    handleOpenChange,
    handleTabChange,
  }
}
