import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import TransactionModal from 'components/transaction-modal'
import useRToken from 'hooks/useRToken'
import { useMemo, useState } from 'react'
import { isAddress } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { Text } from 'theme-ui'
import Input from 'components/input'

const DelegateModal = ({ onClose }: { onClose: () => void }) => {
  const { account } = useWeb3React()
  const rToken = useRToken()
  const [address, setAddress] = useState(account || '')
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
        mt={2}
        value={address}
        onChange={setAddress}
        placeholder={t`Eth address`}
      />
    </TransactionModal>
  )
}

export default DelegateModal
