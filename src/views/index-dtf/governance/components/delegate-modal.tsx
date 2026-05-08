import votesTokenAbi from '@/abis/votes-token'
import TransactionModal from '@/components/transaction-modal'
import { Input } from '@/components/ui/input'
import { walletAtom } from '@/state/atoms'
import { isAddress } from '@/utils'
import { t, Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { Address } from 'viem'

const DelegateModal = ({
  onClose,
  delegated,
  tokenAddress,
  optimistic = false,
  defaultAddress,
}: {
  onClose: () => void
  delegated: boolean
  tokenAddress?: Address
  optimistic?: boolean
  defaultAddress?: string
}) => {
  const account = useAtomValue(walletAtom)
  const [address, setAddress] = useState(
    defaultAddress ?? (!delegated && account ? account : '')
  )
  const validAddress = isAddress(address)
  const call = useMemo(() => {
    return tokenAddress && validAddress
      ? {
          abi: votesTokenAbi,
          address: tokenAddress,
          functionName: optimistic ? 'delegateOptimistic' : 'delegate',
          args: [validAddress],
        }
      : undefined
  }, [tokenAddress, validAddress, optimistic])

  return (
    <TransactionModal
      title={optimistic ? t`Delegate optimistic votes` : t`Delegate votes`}
      description={optimistic ? 'Delegate optimistic votes' : 'Delegate votes'}
      call={call}
      confirmLabel={
        optimistic ? t`Confirm optimistic delegate` : t`Confirm delegate`
      }
      onClose={onClose}
    >
      <label className="text-legend ml-3">
        {optimistic ? (
          <Trans>Delegate optimistic votes to</Trans>
        ) : (
          <Trans>Delegate to</Trans>
        )}
      </label>
      <Input
        autoFocus
        className="mt-2"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={t`ETH address`}
      />
    </TransactionModal>
  )
}

export default DelegateModal
