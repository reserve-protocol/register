import { t, Trans } from '@lingui/macro'
import { Button, Modal } from 'components'
import useTransactionCost from 'hooks/useTransactionCost'
import { useState } from 'react'
import { Box, Checkbox, Divider, Flex, Spinner, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { FACADE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'

// TODO: Terms and conditions copy
// TODO: Contract call signature
// TODO: Show actions
const ConfirmDeployModal = ({
  onConfirm,
  onClose,
}: {
  onConfirm(): void
  onClose(): void
}) => {
  const [confirmed, setConfirmed] = useState(false)

  const fee = useTransactionCost([
    {
      id: '',
      description: '',
      status: '',
      value: '',
      call: {
        abi: 'facade',
        address: FACADE_ADDRESS[CHAIN_ID],
        method: 'deploy',
        args: [],
      },
    },
  ])

  const handleConfirm = () => {
    onClose()
    onConfirm()
  }

  return (
    <Modal title={t`Confirm Deploy`} style={{ width: 420 }} onClose={onClose}>
      <Flex mt={3}>
        <label>
          <Checkbox onChange={() => setConfirmed(!confirmed)} />
        </label>
        <Text>Terms and conditions</Text>
      </Flex>
      <Divider mx={-4} mt={3} />
      <Button
        disabled={!confirmed}
        sx={{ width: '100%' }}
        mt={3}
        onClick={handleConfirm}
      >
        <Trans>Confirm & Deploy</Trans>
      </Button>
      <Box mt={2} sx={{ fontSize: 1, textAlign: 'center' }}>
        <Text mr={1}>Estimated gas cost:</Text>
        {fee ? (
          <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
        ) : (
          <Spinner color="black" size={12} />
        )}
      </Box>
    </Modal>
  )
}

export default ConfirmDeployModal
