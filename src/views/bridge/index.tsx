import { Box, Grid, Text } from 'theme-ui'
import Bridge from './components/Bridge'
import BridgeFaq from './components/BridgeFaq'
import BridgeBoxIcon from 'components/icons/BridgeBoxIcon'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import BridgeTransactions from './components/BridgeTransactions'
import BridgeWithdrawals from './components/BridgeWithdrawals'

enum BridgeMenuKeys {
  Bridge,
  Transactions,
}

const bridgeMenuIndexAtom = atom(BridgeMenuKeys.Bridge)

const MenuItem = ({ index }: { index: BridgeMenuKeys }) => {
  const [current, setMenuIndex] = useAtom(bridgeMenuIndexAtom)

  return (
    <Box
      onClick={() => setMenuIndex(index)}
      sx={{
        width: 160,
        height: '100%',
        justifyContent: 'center',
        borderBottom: '2px solid',
        cursor: 'pointer',
        borderColor: current === index ? 'text' : 'transparent',
      }}
      variant="layout.verticalAlign"
    >
      {index === BridgeMenuKeys.Bridge ? (
        <>
          <BridgeBoxIcon />
          <Text ml={2}>Bridge</Text>
        </>
      ) : (
        <>
          <TransactionsIcon />
          <Text ml={2}>Transactions</Text>
        </>
      )}
    </Box>
  )
}

const BridgeMenu = () => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      justifyContent: 'center',
      borderBottom: '1px solid',
      borderColor: 'border',
      height: 62,
    }}
  >
    <MenuItem index={BridgeMenuKeys.Bridge} />
    <MenuItem index={BridgeMenuKeys.Transactions} />
  </Box>
)

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
  const menuIndex = useAtomValue(bridgeMenuIndexAtom)

  return (
    <>
      <BridgeMenu />
      {menuIndex === BridgeMenuKeys.Bridge ? (
        <BridgeContainer />
      ) : (
        <TransactionsContainer />
      )}
      <BridgeWithdrawals />
    </>
  )
}

export default ChainBridge
