import { Trans } from '@lingui/macro'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import dayjs from 'dayjs'
import { atom, useAtomValue } from 'jotai'
import { ArrowUpRight, Check, X } from 'react-feather'
import { chainIdAtom } from 'state/atoms'
import { TransactionState, currentTxHistoryAtom } from 'state/chain/atoms'
import { borderRadius } from 'theme'
import { Box, Flex, Grid, Link, Spinner, Text } from 'theme-ui'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const txByDateAtom = atom((get) => {
  const txs = get(currentTxHistoryAtom).sort(
    (a, b) => b.timestamp - a.timestamp
  )

  return txs.reduce((txMap, tx) => {
    const date = dayjs(tx.timestamp).format('MMM D')

    if (txMap[date]) {
      txMap[date].push(tx)
    } else {
      txMap[date] = [tx]
    }

    return txMap
  }, {} as { [x: string]: TransactionState[] })
})

const TransactionStatus = ({ tx }: { tx: TransactionState }) => {
  let Icon: any = Spinner
  let label = 'Mining'

  if (tx.status === 'success') {
    Icon = X
    label = `Confirmed, Block ${tx.block}`
  } else if (tx.status === 'error') {
    Icon = Check
    label = `Reverted`
  }

  return (
    <Flex variant="layout.verticalAlign">
      <Icon size={18} />
      <Text ml={2} sx={{ display: ['none', 'flex'] }}>
        {label}
      </Text>
    </Flex>
  )
}

const TransactionList = () => {
  const chainId = useAtomValue(chainIdAtom)
  const txs = useAtomValue(txByDateAtom)

  return (
    <Box pt={3} px={[2, 3]} sx={{ flexGrow: 1, fontSize: 1, overflow: 'auto' }}>
      {Object.keys(txs).map((day) => (
        <Box key={day} mb={4}>
          <Text variant="legend" ml={3}>
            {day}
          </Text>
          {txs[day].map((tx) => (
            <Grid
              columns={['140px 1fr 1fr', '140px 160px auto 72px']}
              gap={3}
              mt={3}
              p={3}
              key={tx.hash}
              sx={{
                backgroundColor: 'contentBackground',
                borderRadius: borderRadius.boxes,
              }}
            >
              <Flex sx={{ overflow: 'hidden', alignItems: 'center' }}>
                {tx.label}
              </Flex>

              <TransactionStatus tx={tx} />
              <Flex sx={{ alignItems: 'center' }}>
                <Link
                  href={getExplorerLink(
                    tx.hash,
                    chainId,
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
