import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { Card } from 'components'
import { LoadingButton } from 'components/button'
import Help from 'components/help'
import TokenBalance from 'components/token-balance'
import TrackAsset from 'components/track-asset'
import { BigNumber } from 'ethers/lib/ethers'
import useRToken from 'hooks/useRToken'
import useTransactionCost from 'hooks/useTransactionCost'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import {
  addTransactionAtom,
  rsrBalanceAtom,
  rsrExchangeRateAtom,
  rsrPriceAtom,
  rTokenAtom,
  rTokenCollaterizedAtom,
  stRsrBalanceAtom,
} from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { smallButton } from 'theme'
import { Box, BoxProps, Divider, Flex, Grid, Text } from 'theme-ui'
import { getTransactionWithGasLimit } from 'utils'
import { RSR, TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { pendingRSRSummaryAtom } from 'views/staking/atoms'

const pendingRSRBalanceAtom = atom(
  (get) => get(pendingRSRSummaryAtom).pendingAmount
)

const PendingBalance = () => {
  const balance = useAtomValue(pendingRSRBalanceAtom)
  const rate = useAtomValue(rsrExchangeRateAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>In Cooldown</Trans>
      </Text>
      <TokenBalance symbol={'RSR'} balance={balance * rate} />
    </Box>
  )
}

// TODO: Create "Claim" component
const AvailableBalance = () => {
  const rToken = useRToken()
  const rate = useAtomValue(rsrExchangeRateAtom)
  const addTransaction = useSetAtom(addTransactionAtom)
  const { index, availableAmount } = useAtomValue(pendingRSRSummaryAtom)
  const [claiming, setClaiming] = useState('')
  const { account } = useWeb3React()
  const claimTx = useTransaction(claiming)
  const canWithdraw = useAtomValue(rTokenCollaterizedAtom)
  const tx = useMemo(() => {
    if (!rToken?.stToken?.address || !canWithdraw || !availableAmount) {
      return null
    }

    return {
      id: '',
      description: t`Withdraw RSR`,
      status: TRANSACTION_STATUS.PENDING,
      value: availableAmount,
      call: {
        abi: 'stRSR',
        address: rToken?.stToken?.address,
        method: 'withdraw',
        args: [account, index.add(BigNumber.from(1))],
      },
    }
  }, [rToken?.address, availableAmount, account])
  const [, , gasLimit] = useTransactionCost(!!tx ? [tx] : [])

  const handleClaim = () => {
    if (tx) {
      const id = uuid()
      setClaiming(id)
      addTransaction([{ ...getTransactionWithGasLimit(tx, gasLimit), id }])
    }
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
      <TokenBalance symbol="RSR" balance={availableAmount * rate} />
      <LoadingButton
        loading={!!claiming}
        disabled={!gasLimit}
        text={t`Withdraw`}
        onClick={handleClaim}
        sx={{ ...smallButton }}
        mt={3}
      />
      {!canWithdraw && (
        <Box
          mt={3}
          variant="layout.verticalAlign"
          sx={{ color: 'warning', fontSize: '1' }}
        >
          <Text mr={2}>Withdrawals unavailable</Text>
          <Help
            content={t`This RToken is currently on recollaterization, when this process is finish withdrawals will be available again.`}
          />
        </Box>
      )}
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
        <Trans>Your staked RSR</Trans>
      </Text>
      <Flex>
        <TokenBalance
          symbol={rToken?.stToken?.symbol ?? ''}
          logoSrc="/svgs/strsr.svg"
          balance={+balance.balance}
          mr={2}
        />
        {!!rToken?.stToken && <TrackAsset token={rToken?.stToken} />}
      </Flex>
      <Box
        ml={'9px'}
        pl={3}
        pt={4}
        mt={-3}
        sx={{ borderLeft: 'solid 1px', borderColor: 'darkBorder' }}
      >
        <Box variant="layout.verticalAlign">
          {/* Line connecting to vertical line connecting to stRSR */}
          <Box
            mt={'8px'}
            ml={-3}
            sx={{
              width: '16px',
              borderTop: 'solid 1px',
              borderColor: 'darkBorder',
            }}
          ></Box>
          <TokenBalance
            mr={'auto'}
            mt={2}
            symbol="RSR Value"
            logoSrc="/svgs/equals.svg"
            balance={+balance.balance * rate}
          />
        </Box>
        <Box variant="layout.verticalAlign">
          {/* Line connecting to vertical line connecting to stRSR */}
          <Box
            mt={'8px'}
            ml={-3}
            sx={{
              width: '16px',
              borderTop: 'solid 1px',
              borderColor: 'darkBorder',
            }}
          ></Box>
          <TokenBalance
            symbol="USD Value"
            logoSrc="/svgs/equals.svg"
            usd
            balance={+balance.balance * rate * rsrPrice}
            mt={2}
          />
        </Box>
      </Box>
    </Box>
  )
}

const RSRBalance = () => {
  const balance = useAtomValue(rsrBalanceAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>RSR in wallet</Trans>
      </Text>
      <Flex>
        <TokenBalance symbol="RSR" balance={+balance.balance} mr={2} />
        <TrackAsset token={RSR} />
      </Flex>
      <Box
        ml={'9px'}
        pl={3}
        pt={4}
        mt={-3}
        sx={{ borderLeft: 'solid 1px', borderColor: 'darkBorder' }}
      >
        <Box variant="layout.verticalAlign">
          {/* Line connecting to vertical line connecting to stRSR */}
          <Box
            mt={'8px'}
            ml={-3}
            sx={{
              width: '16px',
              borderTop: 'solid 1px',
              borderColor: 'darkBorder',
            }}
          ></Box>
          <TokenBalance
            logoSrc="/svgs/equals.svg"
            symbol="USD Value"
            usd
            balance={+balance.balance * rsrPrice}
            mt={2}
          />
        </Box>
      </Box>
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
          borderLeft: ['none', `1px solid ${theme.colors.darkBorder}`],
          borderTop: [`1px solid ${theme.colors.darkBorder}`, 'none'],
        })}
      >
        <RSRBalance />
        <Divider m={0} sx={{ borderColor: 'darkBorder' }} />
        <AvailableBalance />
        <Divider m={0} sx={{ borderColor: 'darkBorder' }} />
        <PendingBalance />
      </Box>
    </Grid>
  </Card>
)

export default Balances
