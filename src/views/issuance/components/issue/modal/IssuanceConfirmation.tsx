import useLastTx from 'hooks/useLastTx'
import { CheckCircle } from 'react-feather'
import { Box, Flex, Spinner, Text } from 'theme-ui'
import { TransactionState } from 'types'
import { TRANSACTION_STATUS } from 'utils/constants'

const Mining = () => (
  <>
    <Spinner />
    <Text variant="h1">Signed & waiting to be mined</Text>
    <br />
    <Text>
      Minting might require a claim transaction to receive the funds on your
      wallet
    </Text>
  </>
)

// TODO: Handle slow mint case
// TODO: Handle amount added message
const Confirmed = ({ tx }: { tx: TransactionState }) => {
  return (
    <>
      <CheckCircle />
      <Text>Minting complete</Text>
      <Text>lorem impsum added</Text>
    </>
  )
}

// TODO: Handle "taking too long" case
const IssuanceConfirmation = ({ onClose }: { onClose: () => void }) => {
  const [tx] = useLastTx(1)

  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
      {tx?.status === TRANSACTION_STATUS.MINING && <Mining />}
      {tx?.status === TRANSACTION_STATUS.CONFIRMED && <Confirmed tx={tx} />}
    </Flex>
  )
}

export default IssuanceConfirmation
