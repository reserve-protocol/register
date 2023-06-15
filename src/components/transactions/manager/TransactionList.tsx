import { Trans } from '@lingui/macro'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import TokenLogo from 'components/icons/TokenLogo'
import dayjs from 'dayjs'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowUpRight, Check, EyeOff, X } from 'react-feather'
import { Link as RouterLink } from 'react-router-dom'
import { chainIdAtom, currentTxAtom, updateTransactionAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Flex, Grid, IconButton, Link, Spinner, Text } from 'theme-ui'
import { TransactionState, WalletTransaction } from 'types'
import { formatCurrency } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

const txByDateAtom = atom((get) => {
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

const txIndexAtom = atom((get) => {
  const txs = get(currentTxAtom)

  return txs.reduce((acc, tx, index) => {
    acc[tx.id] = index
    return acc
  }, {} as { [x: string]: number })
})

const TransactionStatus = ({
  tx,
  index,
}: {
  tx: TransactionState
  index: number
}) => {
  const updateTx = useSetAtom(updateTransactionAtom)

  const handleUntrack = () => {
    updateTx([index, { ...tx, status: TRANSACTION_STATUS.UNKNOWN }])
  }

  switch (tx.status) {
    case TRANSACTION_STATUS.PENDING:
      return (
        <Flex variant="layout.verticalAlign">
          <Text>
            <Trans>Pending</Trans>
          </Text>
        </Flex>
      )
    case TRANSACTION_STATUS.SIGNING:
      return (
        <Flex variant="layout.verticalAlign">
          <Spinner size={18} />
          <Text ml={2} sx={{ display: ['none', 'flex'] }}>
            <Trans>Signing...</Trans>
          </Text>
        </Flex>
      )
    case TRANSACTION_STATUS.MINING:
      return (
        <Flex variant="layout.verticalAlign">
          <Spinner size={18} />
          <Text ml={2} sx={{ display: ['none', 'flex'] }}>
            <Trans>Mining</Trans>
          </Text>
          <IconButton
            p={0}
            variant="layout.verticalAlign"
            ml={3}
            onClick={handleUntrack}
            sx={{ cursor: 'pointer', width: 'auto', height: 'auto' }}
          >
            <EyeOff color="#666666" size={12} />
          </IconButton>
        </Flex>
      )
    case TRANSACTION_STATUS.CONFIRMED:
      return (
        <Flex variant="layout.verticalAlign">
          <Check size={18} />
          <Text ml={2} sx={{ display: ['none', 'flex'] }}>
            <Trans>Confirmed, Block {tx.confirmedAt}</Trans>
          </Text>
        </Flex>
      )
    case TRANSACTION_STATUS.REJECTED:
      return (
        <Flex variant="layout.verticalAlign">
          <X size={18} />
          <Text ml={2} sx={{ display: ['none', 'flex'] }}>
            <Trans>Failed</Trans>
          </Text>
        </Flex>
      )

    default:
      return (
        <Box>
          <Trans>Unknown</Trans>
        </Box>
      )
  }
}

const getTxDescription = (tx: TransactionState) => {
  // rToken deployed
  // TODO: If user has token role, show token on token list then remove this!
  if (tx.extra?.rTokenAddress) {
    return (
      <RouterLink
        style={{ color: 'var(--theme-ui-colors-lightText)' }}
        to={`/overview?token=${tx.extra.rTokenAddress}`}
      >
        <Trans>Use deployed token</Trans>
      </RouterLink>
    )
  }

  return <Text>{tx.description}</Text>
}

const TransactionList = () => {
  const txs = useAtomValue(txByDateAtom)
  const txIdMap = useAtomValue(txIndexAtom)
  const chainId = useAtomValue(chainIdAtom)

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
              key={tx.id}
              sx={{
                backgroundColor: 'contentBackground',
                borderRadius: borderRadius.boxes,
              }}
            >
              <Flex sx={{ overflow: 'hidden', alignItems: 'center' }}>
                {getTxDescription(tx)}
              </Flex>
              <Flex
                sx={{ overflow: 'hidden', display: ['none', 'flex'] }}
                variant="layout.verticalAlign"
              >
                <TokenLogo src="/svgs/equals.svg" mr={3} />
                <Text>{formatCurrency(Number(tx.value))}</Text>
              </Flex>
              <TransactionStatus tx={tx} index={txIdMap[tx.id]} />
              <Flex sx={{ alignItems: 'center' }}>
                {tx.hash ? (
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
                ) : (
                  ''
                )}
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
