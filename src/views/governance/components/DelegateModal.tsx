import { t, Trans } from '@lingui/macro'
import StRSRVotes from 'abis/StRSRVotes'
import Input from 'components/input'
import TransactionModal from 'components/transaction-modal'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { walletAtom } from 'state/atoms'
import { Text } from 'theme-ui'
import { isAddress } from 'utils'

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
  const call = useMemo(() => {
    return rToken?.stToken && validAddress
      ? {
          abi: StRSRVotes,
          address: rToken.stToken.address,
          functionName: 'delegate',
          args: [validAddress],
        }
      : undefined
  }, [rToken?.address, validAddress])

  return (
    <TransactionModal
      title={t`Delegate votes`}
      description="Delegate"
      call={call}
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
