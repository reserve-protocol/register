import { useWeb3React } from '@web3-react/core'
import { StRSRInterface } from 'abis'
import { Button, Card } from 'components'
import TokenBalance from 'components/token-balance'
import { BigNumber } from 'ethers/lib/ethers'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  addTransactionAtom,
  pendingRSRSummaryAtom,
  rsrBalanceAtom,
  rTokenAtom,
  stRsrBalanceAtom,
} from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Box, BoxProps, Divider, Grid, Spinner, Text } from 'theme-ui'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'

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

// TODO: Create "Claim" component
const AvailableBalance = () => {
  const rToken = useAtomValue(rTokenAtom)
  const addTransaction = useSetAtom(addTransactionAtom)
  const { index, availableAmount } = useAtomValue(pendingRSRSummaryAtom)
  const [claiming, setClaiming] = useState('')
  const { account } = useWeb3React()
  const claimTx = useTransaction(claiming)

  const handleClaim = () => {
    if (claiming) return

    const txId = uuid()
    setClaiming(txId)
    addTransaction([
      {
        id: txId,
        description: `Withdraw ${availableAmount} RSR`,
        status: TRANSACTION_STATUS.PENDING,
        value: availableAmount,
        call: {
          abi: StRSRInterface,
          address: rToken?.insurance?.token.address ?? ' ',
          method: 'withdraw',
          args: [account, index.add(BigNumber.from(1))],
        },
      },
    ])
  }

  useEffect(() => {
    if (
      claiming &&
      claimTx &&
      ![TRANSACTION_STATUS.SIGNING, TRANSACTION_STATUS.PENDING].includes(
        claimTx.status
      )
    ) {
      setClaiming('')
    }
  }, [claimTx, claiming])

  return (
    <Box p={4} py={2}>
      <Button
        onClick={handleClaim}
        variant={claiming ? 'accent' : 'primary'}
        sx={{ width: '100%', fontSize: 1, padding: 2, borderRadius: 35 }}
        disabled={!availableAmount}
        mb={3}
      >
        {claiming ? (
          <Text
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spinner size={14} mr={2} /> Withdrawing, Sign in wallet
          </Text>
        ) : (
          <Text>Withdrawn available RSR</Text>
        )}
      </Button>
      <Text variant="subtitle" mb={2}>
        Out of cooldown
      </Text>
      <TokenBalance symbol="RSR" balance={availableAmount} />
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
