import { RTokenInterface } from 'abis'
import TokenBalance from 'components/token-balance'
import { useFacadeContract } from 'hooks/useContract'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { addTransactionAtom, pendingIssuancesSummary } from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Box, Button, Divider, Spinner, Text } from 'theme-ui'
import { Token } from 'types'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'

const PendingIssuances = ({ token }: { token: Token }) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const [claiming, setClaiming] = useState('')
  const claimTx = useTransaction(claiming)
  const { index, pendingAmount, availableAmount } = useAtomValue(
    pendingIssuancesSummary
  )

  const handleClaim = () => {
    const txId = uuid()
    setClaiming(txId)
    addTransaction([
      {
        id: txId,
        description: `Claim ${availableAmount} ${token.symbol}`,
        status: TRANSACTION_STATUS.PENDING,
        value: '0',
        call: {
          abi: RTokenInterface,
          address: token.address,
          method: 'vestUpTo',
          args: [''],
        },
      },
    ])
  }

  useEffect(() => {
    if (claiming && claimTx && claimTx.status !== TRANSACTION_STATUS.SIGNING) {
      setClaiming('')
    }
  }, [claimTx, claiming])

  return (
    <>
      <Box px={4} py={2}>
        <Button
          onClick={handleClaim}
          variant={claiming ? 'accent' : 'primary'}
          sx={{ width: '100%' }}
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
              <Spinner size={14} mr={2} /> Claiming, Sign in wallet
            </Text>
          ) : (
            <Text>Claim vested {token.symbol}</Text>
          )}
        </Button>
        <Text variant="contentTitle" sx={{ fontSize: 2 }} mb={2}>
          Available
        </Text>
        <TokenBalance token={token} balance={availableAmount} />
      </Box>
      <Divider />
      <Box px={4} py={2} mb={2}>
        <Text variant="contentTitle" sx={{ fontSize: 2 }} mb={2}>
          Pending
        </Text>
        <TokenBalance token={token} balance={pendingAmount} />
      </Box>
    </>
  )
}

export default PendingIssuances
