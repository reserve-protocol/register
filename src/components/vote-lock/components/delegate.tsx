import { Input } from '@/components/ui/input'
import { walletAtom } from '@/state/atoms'
import { formatCurrency } from '@/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Rocket, Vote } from 'lucide-react'
import type { ReactNode } from 'react'
import { isAddress } from 'viem'
import {
  hasVoteLockedBalanceAtom,
  normalDelegateAtom,
  normalDelegateTouchedAtom,
  optimisticDelegateAtom,
  optimisticDelegateTouchedAtom,
  stTokenAtom,
  voteLockStateAtom,
} from '../atoms'

const DelegateInput = ({
  label,
  icon,
  value,
  onChange,
  disabled,
  error,
  placeholder,
}: {
  label: ReactNode
  icon?: ReactNode
  value: string
  onChange: (value: string) => void
  disabled: boolean
  error?: ReactNode
  placeholder?: string
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-foreground ml-3">
      {icon}
      {label}
    </label>
    <div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="h-11 rounded-xl bg-background px-3 text-sm disabled:opacity-70"
      />
      {!!error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  </div>
)

const DelegateView = ({
  isOptimisticGovernance,
}: {
  isOptimisticGovernance: boolean
}) => {
  const { t } = useLingui()
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(stTokenAtom)
  const voteLockState = useAtomValue(voteLockStateAtom)
  const hasVoteLockedBalance = useAtomValue(hasVoteLockedBalanceAtom)
  const [normalDelegate, setNormalDelegate] = useAtom(normalDelegateAtom)
  const [optimisticDelegate, setOptimisticDelegate] = useAtom(
    optimisticDelegateAtom
  )
  const setNormalDelegateTouched = useSetAtom(normalDelegateTouchedAtom)
  const setOptimisticDelegateTouched = useSetAtom(optimisticDelegateTouchedAtom)
  const disabled = !account || !hasVoteLockedBalance
  const hasInvalidNormalDelegate =
    !!normalDelegate && !isAddress(normalDelegate, { strict: false })
  const hasInvalidOptimisticDelegate =
    !!optimisticDelegate && !isAddress(optimisticDelegate, { strict: false })
  const currentLockedAmount = voteLockState
    ? `${formatCurrency(Number(voteLockState.maxWithdraw.formatted), 4, {
        minimumFractionDigits: 0,
      })} ${stToken?.underlying.symbol ?? ''}`
    : undefined

  return (
    <div className="rounded-3xl border bg-background p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-2xl text-primary font-semibold">
          <Trans>Delegation</Trans>
        </h2>
        <p className="mt-3 text-sm text-foreground">
          {isOptimisticGovernance ? (
            <Trans>
              Normal and fast governance use separate delegates. Normal
              delegates vote on normal proposals. Fast delegates can challenge
              fast proposals.
            </Trans>
          ) : (
            <Trans>
              Enter the wallet address that should vote on normal governance
              proposals.
            </Trans>
          )}
        </p>
        {disabled && (
          <p className="mt-4 rounded-2xl bg-muted px-4 py-3 text-sm text-legend">
            {account ? (
              <Trans>
                Self-delegation happens automatically when you vote-lock{' '}
                {stToken?.underlying.symbol ?? t`tokens`}. Come back here after
                vote-locking to update delegation.
              </Trans>
            ) : (
              <Trans>
                Connect your wallet to set a delegate after vote-locking.
              </Trans>
            )}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <DelegateInput
          label={<Trans>Normal</Trans>}
          icon={<Vote size={16} />}
          value={normalDelegate}
          onChange={(value) => {
            setNormalDelegateTouched(true)
            setNormalDelegate(value)
          }}
          disabled={disabled}
          error={
            hasInvalidNormalDelegate ? (
              <Trans>Invalid address</Trans>
            ) : undefined
          }
          placeholder={t`Wallet address`}
        />
        {isOptimisticGovernance && (
          <DelegateInput
            label={<Trans>Fast</Trans>}
            icon={<Rocket size={16} className="text-primary" />}
            value={optimisticDelegate}
            onChange={(value) => {
              setOptimisticDelegateTouched(true)
              setOptimisticDelegate(value)
            }}
            disabled={disabled}
            error={
              hasInvalidOptimisticDelegate ? (
                <Trans>Invalid address</Trans>
              ) : undefined
            }
            placeholder={t`Wallet address`}
          />
        )}
      </div>

      {!!currentLockedAmount && (
        <p className="text-sm text-center text-legend">
          <Trans>Current locked amount:</Trans>{' '}
          <span className="text-primary">{currentLockedAmount}</span>
        </p>
      )}
    </div>
  )
}

export default DelegateView
