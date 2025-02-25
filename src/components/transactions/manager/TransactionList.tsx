import { Trans } from '@lingui/macro'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import dayjs from 'dayjs'
import { atom, useAtomValue } from 'jotai'
import { ArrowUpRight, Check, X } from 'lucide-react'
import { chainIdAtom } from 'state/atoms'
import {
  TransactionState,
  currentTxHistoryAtom,
} from 'state/chain/atoms/transactionAtoms'
import { borderRadius } from 'theme'
import { Box, Flex, Grid, Link, Spinner, Text } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const txByDateAtom = atom((get) => {
  const txs = get(currentTxHistoryAtom)

  return txs.reduce(
    (txMap, tx) => {
      const date = dayjs(tx.timestamp).format('MMM D')

      if (txMap[date]) {
        txMap[date].push(tx)
      } else {
        txMap[date] = [tx]
      }

      return txMap
    },
    {} as { [x: string]: TransactionState[] }
  )
})

const TransactionItem = ({ tx }: { tx: TransactionState }) => {
  let Icon: any = Spinner
  let label = 'Mining'

  if (tx.status === 'success') {
    Icon = Check
    label = `Confirmed, Block ${tx.block}`
  } else if (tx.status === 'error') {
    Icon = X
    label = `Reverted`
  }

  return (
    <Grid
      columns={['0.5fr 1fr auto']}
      gap={3}
      mt={3}
      p={3}
      key={tx.hash}
      sx={{
        backgroundColor: 'contentBackground',
        borderRadius: borderRadius.boxes,
      }}
    >
      <Flex sx={{ overflow: 'hidden', alignItems: 'center' }}>{tx.label}</Flex>
      <Flex variant="layout.verticalAlign">
        <Icon size={18} />
        <Text ml={2}>{label}</Text>
      </Flex>{' '}
      <Flex sx={{ alignItems: 'center' }}>
        <Link
          href={getExplorerLink(
            tx.hash,
            useAtomValue(chainIdAtom),
            ExplorerDataType.TRANSACTION
          )}
          target="_blank"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Text mr={2}>
            <Trans>Inspect</Trans>
          </Text>
          <ArrowUpRight size={16} />
        </Link>
      </Flex>
    </Grid>
  )
}

const TransactionList = () => {
  const txs = useAtomValue(txByDateAtom)

  return (
    <Box pt={3} px={[2, 3]} sx={{ flexGrow: 1, fontSize: 1, overflow: 'auto' }}>
      {Object.keys(txs).map((day) => (
        <Box key={day} mb={4}>
          <Text variant="legend" ml={3}>
            {day}
          </Text>
          {txs[day].map((tx) => (
            <TransactionItem key={tx.hash} tx={tx} />
          ))}
        </Box>
      ))}
      {!Object.keys(txs).length && (
        <Box
          mt={'42%'}
          sx={{
            textAlign: 'center',
          }}
        >
          <EmptyBoxIcon />
          <Text variant="legend" mt={3} sx={{ display: 'block' }}>
            <Trans>No transactions in local memory...</Trans>
          </Text>
        </Box>
      )}
    </Box>
  )
}

export default TransactionList
