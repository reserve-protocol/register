import useLastTx from 'hooks/useLastTx'
import { Box, Flex, Spinner, Text } from 'theme-ui'

// TODO: Handle "taking too long" case
const IssuanceConfirmation = () => {
  const tx = useLastTx(1)

  return (
    <Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
      <Text variant="h1">Signed & waiting to be mined</Text>
      <br />
      <Text>
        Minting might require a claim transaction to receive the funds on your
        wallet
      </Text>
    </Flex>
  )
}

export default IssuanceConfirmation
