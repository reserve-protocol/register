import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionModal from '@/components/transaction-modal'
import { Input } from '@/components/ui/input'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { isAddress } from '@/utils'
import { t, Trans } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'

const DelegateModal = ({
  onClose,
  delegated,
}: {
  onClose: () => void
  delegated: boolean
}) => {
  const account = useAtomValue(walletAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const [address, setAddress] = useState(!delegated && account ? account : '')
  const validAddress = isAddress(address)
  const call = useMemo(() => {
    return dtf?.stToken && validAddress
      ? {
          abi: dtfIndexStakingVault,
          address: dtf.stToken.id,
          functionName: 'delegate',
          args: [validAddress],
        }
      : undefined
  }, [dtf?.stToken?.id, validAddress])

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
