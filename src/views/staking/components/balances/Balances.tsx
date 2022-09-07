import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { Card } from 'components'
import { LoadingButton } from 'components/button'
import TokenBalance from 'components/token-balance'
import { BigNumber } from 'ethers/lib/ethers'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
  addTransactionAtom,
  pendingRSRSummaryAtom,
  rsrBalanceAtom,
  rsrExchangeRateAtom,
  rsrPriceAtom,
  rTokenAtom,
  stRsrBalanceAtom,
} from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { smallButton } from 'theme'
import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'

const pendingRSRBalanceAtom = atom(
  (get) => get(pendingRSRSummaryAtom).pendingAmount
)

const PendingBalance = () => {
  const balance = useAtomValue(pendingRSRBalanceAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>In Cooldown</Trans>
      </Text>
      <TokenBalance symbol="RSR" balance={balance} />
    </Box>
  )
}

// TODO: Create "Claim" component
const AvailableBalance = () => {
  const rToken = useRToken()
  const addTransaction = useSetAtom(addTransactionAtom)
  const { index, availableAmount } = useAtomValue(pendingRSRSummaryAtom)
  const [claiming, setClaiming] = useState('')
  const { account } = useWeb3React()
  const claimTx = useTransaction(claiming)

  const handleClaim = () => {
    const txId = uuid()
    setClaiming(txId)
    addTransaction([
      {
        id: txId,
        description: t`Withdraw RSR`,
        status: TRANSACTION_STATUS.PENDING,
        value: availableAmount,
        call: {
          abi: 'stRSR',
          address: rToken?.stToken?.address ?? ' ',
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
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>Available</Trans>
      </Text>
      <TokenBalance symbol="RSR" balance={availableAmount} />
      <LoadingButton
        loading={!!claiming}
        disabled={!availableAmount}
        text={t`Withdraw`}
        onClick={handleClaim}
        sx={{ ...smallButton }}
        mt={3}
      />
    </Box>
  )
}

const StakeBalance = () => {
  const rToken = useAtomValue(rTokenAtom)
  const balance = useAtomValue(stRsrBalanceAtom)
  const rate = useAtomValue(rsrExchangeRateAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>Your stake</Trans>
      </Text>
      <TokenBalance symbol={rToken?.stToken?.symbol ?? ''} balance={balance} />
      <TokenBalance mt={2} symbol="RSR Value" balance={balance * rate} />
      <TokenBalance
        symbol="USD"
        usd
        balance={balance * rate * rsrPrice}
        mt={2}
      />
    </Box>
  )
}

const RSRBalance = () => {
  const balance = useAtomValue(rsrBalanceAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>In Wallet</Trans>
      </Text>
      <TokenBalance symbol="RSR" balance={balance} />
      <TokenBalance symbol="USD" usd balance={balance * rsrPrice} mt={2} />
    </Box>
  )
}

/**
 * Display collateral tokens balances
 */
const Balances = (props: BoxProps) => (
  <Card p={0} {...props}>
    <Grid columns={[1, 2]} gap={0}>
      <StakeBalance />
      <Box
        sx={(theme: any) => ({
          borderLeft: ['none', `1px solid ${theme.colors.border}`],
          borderTop: [`1px solid ${theme.colors.border}`, 'none'],
        })}
      >
        <RSRBalance />
        <Divider m={0} />
        <AvailableBalance />
        <Divider m={0} />
        <PendingBalance />
      </Box>
    </Grid>
  </Card>
)

export default Balances
