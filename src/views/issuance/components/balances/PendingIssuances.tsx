import TokenBalance from 'components/token-balance'
import { Box, Button, Divider, Text } from 'theme-ui'
import { Token } from 'types'

{
  /* <TokenBalance
token={rToken.token}
balance={tokenBalances[rToken.token.address]}
/> */
}

const PendingIssuances = ({ token }: { token: Token }) => {
  return (
    <>
      <Box px={4} py={2}>
        <Button sx={{ width: '100%' }} mb={3}>
          Claim vested {token.symbol}
        </Button>
        <Text variant="contentTitle" sx={{ fontSize: 2 }} mb={2}>
          Available
        </Text>
        <TokenBalance token={token} balance={0} />
      </Box>
      <Divider sx={{ borderColor: '#ccc' }} />
      <Box px={4} py={2} mb={2}>
        <Text variant="contentTitle" sx={{ fontSize: 2 }} mb={2}>
          Pending
        </Text>
        <TokenBalance token={token} balance={0} />
      </Box>
    </>
  )
}

export default PendingIssuances
