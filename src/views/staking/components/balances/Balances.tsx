import { Card } from 'components'
import TokenBalance from 'components/token-balance'
import { useAtomValue } from 'jotai'
import { rsrBalanceAtom, rTokenAtom, stRsrBalanceAtom } from 'state/atoms'
import { Box, BoxProps, Grid, Text } from 'theme-ui'

const StakeBalance = () => {
  const rToken = useAtomValue(rTokenAtom)
  const balance = useAtomValue(stRsrBalanceAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={2}>
        Your stake
      </Text>
      <TokenBalance
        symbol={rToken?.insurance?.token.symbol ?? ''}
        balance={balance}
      />
    </Box>
  )
}

const RSRBalance = () => {
  const balance = useAtomValue(rsrBalanceAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={2}>
        In Wallet
      </Text>
      <TokenBalance symbol="RSR" balance={balance} />
    </Box>
  )
}

/**
 * Display collateral tokens balances
 */
const Balances = (props: BoxProps) => (
  <Card p={0} {...props}>
    <Grid columns={2}>
      <StakeBalance />
      <Box ml={-2} sx={{ borderLeft: '1px solid', borderColor: 'secondary' }}>
        <RSRBalance />
      </Box>
    </Grid>
  </Card>
)

export default Balances
