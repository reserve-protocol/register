import { Trans } from '@lingui/macro'
import Portal from '@reach/portal'
import Button from 'components/button'
import dayjs from 'dayjs'
import { atom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { ExternalLink, X } from 'react-feather'
import { currentTxAtom } from 'state/atoms'
import { Box, Flex, Grid, Link, Text } from 'theme-ui'
import { WalletTransaction } from 'types'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { txSidebarToggleAtom } from './atoms'

const txByDate = atom((get) => {
  const txs = get(currentTxAtom).slice(0).reverse()

  return txs.reduce((txMap, tx) => {
    const date = dayjs(tx.createdAt).format('MMM D')

    if (txMap[date]) {
      txMap[date].push(tx)
    } else {
      txMap[date] = [tx]
    }

    return txMap
  }, {} as WalletTransaction)
})

const TransactionList = () => {
  const txs = useAtomValue(txByDate)

  console.log('txs', txs)

  return (
    <Box>
      {Object.keys(txs).map((day) => (
        <Box key={day} mb={3}>
          <Text>{day}</Text>
          {txs[day].map((tx) => (
            <Grid
              columns={'1fr 0.8fr 1.5fr 1fr'}
              gap={3}
              mt={2}
              p={3}
              key={tx.id}
              sx={{ backgroundColor: 'contentBackground' }}
            >
              <Box>
                <Text>{tx.description}</Text>
              </Box>
              <Box>{tx.value}</Box>
              <Box>{tx.status}</Box>
              {tx.hash ? (
                <Link
                  href={getExplorerLink(tx.hash, ExplorerDataType.TRANSACTION)}
                  target="_blank"
                  sx={{ fontSize: 1 }}
                >
                  <ExternalLink size={12} /> <Trans>View on etherscan</Trans>
                </Link>
              ) : (
                ''
              )}
            </Grid>
          ))}
        </Box>
      ))}
    </Box>
  )
}

const TransactionSidebar = () => {
  const setSidebar = useUpdateAtom(txSidebarToggleAtom)

  return (
    <Portal>
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100000,
          opacity: '50%',
          width: '100vw',
          height: '100vh',
          backgroundColor: 'black',
        }}
      />
      <Box
        px={4}
        py={3}
        sx={{
          zIndex: 100001,
          position: 'absolute',
          maxWidth: ['100vw', '768px'],
          width: ['100vw', '100vw', '60vw'],
          backgroundColor: 'background',
          right: 0,
          top: 0,
          height: '100vh',
        }}
      >
        <Flex sx={{ alignItems: 'center' }} mb={4}>
          <Text variant="sectionTitle">Recent Transactions</Text>
          <Box mx="auto" />
          <Button variant="circle" onClick={() => setSidebar(false)}>
            <X />
          </Button>
        </Flex>
        <TransactionList />
      </Box>
    </Portal>
  )
}

export default TransactionSidebar
