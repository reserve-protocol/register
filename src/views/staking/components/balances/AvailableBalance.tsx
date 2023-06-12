import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { LoadingButton } from 'components/button'
import Help from 'components/help'
import TokenBalance from 'components/token-balance'
import { BigNumber } from 'ethers/lib/ethers'
import useRToken from 'hooks/useRToken'
import useTransactionCost from 'hooks/useTransactionCost'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import {
  addTransactionAtom,
  rsrExchangeRateAtom,
  rTokenCollaterizedAtom,
} from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { smallButton } from 'theme'
import { Box, Text } from 'theme-ui'
import { getTransactionWithGasLimit } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { pendingRSRSummaryAtom } from 'views/staking/atoms'

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

export default AvailableBalance
