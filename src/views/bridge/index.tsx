import { Box, Grid, Text } from 'theme-ui'
import Bridge from './components/Bridge'
import BridgeFaq from './components/BridgeFaq'
import BridgeBoxIcon from 'components/icons/BridgeBoxIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import BridgeTransactions from './components/BridgeTransactions'
import BridgeWithdrawals from './components/BridgeWithdrawals'

const BridgeContainer = () => {
  return (
    <Grid
      columns={[1, 1, 2]}
      px={[1, 4, 4, 8, 9]}
      py={[1, 5, 5, 8]}
      gap={5}
      sx={{ overflow: 'auto' }}
    >
      <Bridge />
      <Box sx={{ height: 'fit-content' }}>
        <BridgeFaq />
      </Box>
    </Grid>
  )
}

const TransactionsContainer = () => {
  return (
    <Box px={[1, 4, 4, 8, 9]} py={[1, 5, 5, 8]}>
      <BridgeTransactions />
      <BridgeFaq mt={5} />
    </Box>
  )
}

const ChainBridge = () => {
  return (
    <>
      <BridgeContainer />
      <BridgeWithdrawals />
    </>
  )
}

export default ChainBridge
