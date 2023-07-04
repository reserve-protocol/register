import { t, Trans } from '@lingui/macro'
import TransactionModal from 'components/transaction-modal'
import useRToken from 'hooks/useRToken'
import { useMemo, useState } from 'react'
import { isAddress } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { Text } from 'theme-ui'
import Input from 'components/input'
import { useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'

const DelegateModal = ({
  onClose,
  delegated,
}: {
  onClose: () => void
  delegated: boolean
}) => {
  const account = useAtomValue(walletAtom)
  const rToken = useRToken()
  const [address, setAddress] = useState(!delegated && account ? account : '')
  const validAddress = isAddress(address)
  const transaction = useMemo(
    () => ({
      id: '',
      description: t`Delegate voting`,
      status: TRANSACTION_STATUS.PENDING,
      value: '0',
      call: {
        abi: 'stRSRVotes',
        address: rToken?.stToken?.address ?? '',
        method: 'delegate',
        args: [validAddress || ''],
      },
    }),
    [rToken?.address, validAddress]
  )

  return (
    <TransactionModal
      title={t`Delegate votes`}
      requiredAllowance={{}}
      tx={transaction}
      isValid={!!validAddress}
      confirmLabel={t`Confirm delegate`}
      onClose={onClose}
    >
      <Text as="label" variant="legend" ml={3}>
        <Trans>Delegate to</Trans>
      </Text>
      <Input
        autoFocus
        mt={2}
        value={address}
        onChange={setAddress}
        placeholder={t`Eth address`}
      />
    </TransactionModal>
  )
}

export default DelegateModal
