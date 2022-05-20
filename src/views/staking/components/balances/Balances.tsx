import { Card } from 'components'
import TokenBalance from 'components/token-balance'
import { atom, useAtomValue } from 'jotai'
import {
  pendingRSRSummaryAtom,
  rsrBalanceAtom,
  rTokenAtom,
  stRsrBalanceAtom,
} from 'state/atoms'
import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'

const availableRSRBalanceAtom = atom(
  (get) => get(pendingRSRSummaryAtom).availableAmount
)
const pendingRSRBalanceAtom = atom(
  (get) => get(pendingRSRSummaryAtom).pendingAmount
)

const PendingBalance = () => {
  const balance = useAtomValue(pendingRSRBalanceAtom)

  return (
    <Box p={4} py={2} mb={2}>
      <Text variant="subtitle" mb={2}>
        In Cooldown
      </Text>
      <TokenBalance symbol="RSR" balance={balance} />
    </Box>
  )
}

const AvailableBalance = () => {
  const balance = useAtomValue(availableRSRBalanceAtom)

  return (
    <Box p={4} py={2}>
      <Text variant="subtitle" mb={2}>
        Out of cooldown
      </Text>
      <TokenBalance symbol="RSR" balance={balance} />
    </Box>
  )
}

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
    <Box p={4} pb={2}>
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
        <Divider />
        <AvailableBalance />
        <Divider />
        <PendingBalance />
      </Box>
    </Grid>
  </Card>
)

export default Balances
