import { Checkbox } from '@/components/ui/checkbox'
import { DrawerFooter } from '@/components/ui/drawer'
import { Trans } from '@lingui/react/macro'
import { useAtom, useAtomValue } from 'jotai'
import { Asterisk, OctagonAlert } from 'lucide-react'
import {
  lockCheckboxAtom,
  stTokenAtom,
  unlockDelayAtom,
  type VoteLockTab,
} from '../atoms'
import SubmitDelegateButton from './submit-delegate-button'
import SubmitLockButton from './submit-lock-button'
import SubmitUnlockButton from './submit-unlock-button'

const LockCheckbox = () => {
  const stToken = useAtomValue(stTokenAtom)
  const delay = useAtomValue(unlockDelayAtom)
  const [checkbox, setCheckbox] = useAtom(lockCheckboxAtom)

  if (!stToken || delay === undefined) return null

  return (
    <label className="flex flex-col gap-2 px-4 py-6 cursor-pointer">
      <OctagonAlert size={16} className="text-warning" />
      <div className="flex items-end gap-2 justify-between">
        <div className="max-w-sm">
          <div className="font-bold">
            <Trans>I'm aware of the {delay}-day unlock delay</Trans>
          </div>
          <div className="text-sm text-legend">
            <Trans>
              If you decide to unlock {stToken.underlying.symbol} in the future,
              you'll need to wait {delay} days until you can complete the
              withdrawal
            </Trans>
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

  if (!stToken || delay === undefined) return null

  return (
    <div className="flex-grow flex flex-col gap-1 items-center justify-center">
      <div className="rounded-full bg-primary p-1 w-max">
        <Asterisk size={20} className="text-white" />
      </div>
      <div className="font-bold mt-3">
        <Trans>Unlock process</Trans>
      </div>
      <div className="text-primary mt-3">1.</div>
      <div className="text-md max-w-sm text-center -mt-1">
        <Trans>
          A {delay}-day unlock delay period begins &amp; you stop accumulating
          rewards
        </Trans>
      </div>
      <div className="text-primary mt-3">2.</div>
      <div className="text-md max-w-sm text-center -mt-1">
        <Trans>Wait {delay} days</Trans>
      </div>
      <div className="text-primary mt-3">3.</div>
      <div className="text-md max-w-sm text-center -mt-1">
        <Trans>
          Come back to your account balance page to withdraw your unlocked{' '}
          {stToken.underlying.symbol}
        </Trans>
      </div>
    </div>
  )
}

const VoteLockDrawerFooter = ({
  currentTab,
  isOptimisticGovernance,
  onRefresh,
}: {
  currentTab: VoteLockTab
  isOptimisticGovernance: boolean
  onRefresh?: () => void
}) => {
  return (
    <DrawerFooter className="flex-grow justify-end mb-2">
      {currentTab === 'lock' && (
        <>
          <LockCheckbox />
          <SubmitLockButton onSuccess={onRefresh} />
        </>
      )}
      {currentTab === 'unlock' && (
        <>
          <UnlockProcess />
          <SubmitUnlockButton onSuccess={onRefresh} />
        </>
      )}
      {currentTab === 'delegate' && (
        <SubmitDelegateButton
          isOptimisticGovernance={isOptimisticGovernance}
          onSuccess={onRefresh}
        />
      )}
    </DrawerFooter>
  )
}

export default VoteLockDrawerFooter
