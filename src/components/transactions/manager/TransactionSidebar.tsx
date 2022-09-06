import { Trans } from '@lingui/macro'
import Portal from '@reach/portal'
import { useWeb3React } from '@web3-react/core'
import Button from 'components/button'
import TokenLogo from 'components/icons/TokenLogo'
import WalletIcon from 'components/icons/WalletIcon'
import dayjs from 'dayjs'
import { atom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { Check, Edit, ExternalLink, X } from 'react-feather'
import { Link as RouterLink } from 'react-router-dom'
import { currentTxAtom, isWalletModalVisibleAtom } from 'state/atoms'
import { borderRadius } from 'theme'
import { Box, Flex, Grid, Link, Spinner, Text } from 'theme-ui'
import { TransactionState, WalletTransaction } from 'types'
import { formatCurrency, shortenAddress } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { txSidebarToggleAtom } from './atoms'

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

// TODO: Common component or map
const TransactionStatus = ({ tx }: { tx: TransactionState }) => {
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
          <Text ml={2}>
            <Trans>Signing...</Trans>
          </Text>
        </Flex>
      )
    case TRANSACTION_STATUS.MINING:
      return (
        <Flex variant="layout.verticalAlign">
          <Spinner size={18} />
          <Text ml={2}>
            <Trans>Mining</Trans>
          </Text>
        </Flex>
      )
    case TRANSACTION_STATUS.CONFIRMED:
      return (
        <Flex variant="layout.verticalAlign">
          <Check size={18} />
          <Text ml={2}>
            <Trans>Confirmed, Block {tx.confirmedAt}</Trans>
          </Text>
        </Flex>
      )
    case TRANSACTION_STATUS.REJECTED:
      return (
        <Flex variant="layout.verticalAlign">
          <X size={18} />
          <Text ml={2}>
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

const TransactionList = () => {
  const txs = useAtomValue(txByDateAtom)

  return (
    <Box sx={{ flexGrow: 1, fontSize: 1, overflow: 'auto' }}>
      {Object.keys(txs).map((day) => (
        <Box key={day} mb={4}>
          <Text variant="legend" ml={3}>
            {day}
          </Text>
          {txs[day].map((tx) => (
            <Grid
              columns={'140px 160px auto 64px'}
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
                {tx.extra?.rTokenAddress ? (
                  <RouterLink
                    style={{ color: 'var(--theme-ui-colors-lightText)' }}
                    to={`/overview?token=${tx.extra.rTokenAddress}`}
                  >
                    <Trans>Use deployed token</Trans>
                  </RouterLink>
                ) : (
                  <Text>{tx.description}</Text>
                )}
              </Flex>
              <Flex sx={{ overflow: 'hidden' }} variant="layout.verticalAlign">
                <TokenLogo symbol="rsv" mr={3} />
                <Text>{formatCurrency(Number(tx.value))}</Text>
              </Flex>
              <TransactionStatus tx={tx} />
              <Flex sx={{ alignItems: 'center' }}>
                {tx.hash ? (
                  <Link
                    href={getExplorerLink(
                      tx.hash,
                      ExplorerDataType.TRANSACTION
                    )}
                    target="_blank"
                  >
                    <ExternalLink size={12} /> <Trans>View</Trans>
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
        <Box mt={5} sx={{ textAlign: 'center' }}>
          <Text variant="legend">No transactions...</Text>
        </Box>
      )}
    </Box>
  )
}

const TransactionSidebar = () => {
  const setSidebar = useUpdateAtom(txSidebarToggleAtom)
  const setWalletModal = useUpdateAtom(isWalletModalVisibleAtom)
  const { ENSName, account } = useWeb3React()

  const handleChangeWallet = () => {
    setSidebar(false)
    setWalletModal(true)
  }

  return (
    <Portal>
      <Box
        onClick={() => setSidebar(false)}
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
      <Flex
        px={6}
        sx={{
          flexDirection: 'column',
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
        <Flex sx={{ alignItems: 'center' }} mt={3} mb={4}>
          <WalletIcon />
          <Text ml={2}>{ENSName || shortenAddress(account ?? '')}</Text>
          <Button ml={3} variant="circle" onClick={handleChangeWallet}>
            <Edit size={14} />
          </Button>
          <Button ml="auto" variant="circle" onClick={() => setSidebar(false)}>
            <X />
          </Button>
        </Flex>
        <TransactionList />
      </Flex>
    </Portal>
  )
}

export default TransactionSidebar
