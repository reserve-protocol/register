import useLastTx from 'hooks/useLastTx'
import { CheckCircle } from 'react-feather'
import { Box, Flex, Spinner, Text } from 'theme-ui'
import { TransactionState } from 'types'
import { TRANSACTION_STATUS } from 'utils/constants'

const IssuanceConfirmation = ({ onClose }: { onClose: () => void }) => {
  const [tx] = useLastTx(1)

  return (
    <Flex
      p={4}
      sx={{
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <CheckCircle size={36} />
      <br />
      <Text>Transaction signed!</Text>
    </Flex>
  )
}

export default IssuanceConfirmation
