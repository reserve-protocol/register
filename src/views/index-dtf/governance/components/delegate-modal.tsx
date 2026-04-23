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
}: {
  onClose: () => void
  delegated: boolean
  tokenAddress?: Address
}) => {
  const account = useAtomValue(walletAtom)
  const [address, setAddress] = useState(!delegated && account ? account : '')
  const validAddress = isAddress(address)
  const call = useMemo(() => {
    return tokenAddress && validAddress
      ? {
          abi: votesTokenAbi,
          address: tokenAddress,
          functionName: 'delegate',
          args: [validAddress],
        }
      : undefined
  }, [tokenAddress, validAddress])

  return (
    <TransactionModal
      title={t`Delegate votes`}
      description="Delegate"
      call={call}
      confirmLabel={t`Confirm delegate`}
      onClose={onClose}
    >
      <label className="text-legend ml-3">
        <Trans>Delegate to</Trans>
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
