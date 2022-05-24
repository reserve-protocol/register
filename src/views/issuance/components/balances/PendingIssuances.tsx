import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'
import { LoadingButton } from 'components/button'
import TokenBalance from 'components/token-balance'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { addTransactionAtom, pendingIssuancesSummary } from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { smallButton } from 'theme'
import { Box, Divider, Text } from 'theme-ui'
import { Token } from 'types'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'

const PendingIssuances = ({ token }: { token: Token }) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const [claiming, setClaiming] = useState('')
  const { account } = useWeb3React()
  const claimTx = useTransaction(claiming)
  const { index, pendingAmount, availableAmount } = useAtomValue(
    pendingIssuancesSummary
  )

  const handleClaim = () => {
    if (claiming) return

    const txId = uuid()
    setClaiming(txId)
    addTransaction([
      {
        id: txId,
        description: `Claim ${availableAmount} ${token.symbol}`,
        status: TRANSACTION_STATUS.PENDING,
        value: availableAmount,
        call: {
          abi: 'rToken',
          address: token.address,
          method: 'vest',
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
    <>
      <Box px={4} py={2}>
        <LoadingButton
          loading={!!claiming}
          disabled={!availableAmount}
          text={`Claim vested ${token.symbol}`}
          onClick={handleClaim}
          sx={{ ...smallButton, width: '100%' }}
          mb={3}
        />
        <Text variant="subtitle" mb={2}>
          Available
        </Text>
        <TokenBalance symbol={token.symbol} balance={availableAmount} />
      </Box>
      <Divider />
      <Box px={4} py={2} mb={2}>
        <Text variant="subtitle" mb={2}>
          Pending
        </Text>
        <TokenBalance symbol={token.symbol} balance={pendingAmount} />
      </Box>
    </>
  )
}

export default PendingIssuances
