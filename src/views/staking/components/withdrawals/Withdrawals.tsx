import { useState } from 'react'
import { gql, useSubscription } from '@apollo/client'
import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { Box, Card, BoxProps, Text, Divider, Flex } from '@theme-ui/components'
import { useBlockNumber, useEthers } from '@usedapp/core'
import { Button, Modal } from 'components'
import { formatEther } from 'ethers/lib/utils'
import { formatCurrency } from 'utils'
import { Table } from 'components/table'
import {
  loadTransactions,
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { StRSRInterface } from 'abis'

const pendingWithdrawalsQuery = gql`
  subscription GetPendingWithdrawals($userId: String!) {
    entries(where: { type: "Unstake", status: Pending, user: $userId }) {
      id
      amount
      draftId
      stAmount
      availableAt
    }
  }
`

const columns = [
  {
    Header: 'Amount',
    accessor: 'amount',
    Cell: ({ cell }: { cell: any }) =>
      `${formatCurrency(parseFloat(formatEther(cell.value)))} RSR`,
  },
  { Header: 'Block available at', accessor: 'availableAt' },
]

const Withdrawals = (props: BoxProps) => {
  const [visible, setVisible] = useState(false)
  const { account } = useEthers()
  const [, dispatch] = useTransactionsState()
  const blockNumber = useBlockNumber() ?? ''
  const { data, loading } = useSubscription(pendingWithdrawalsQuery, {
    variables: {
      orderBy: 'draftId',
      where: {},
      userId: account?.toLowerCase(),
    },
  })

  const entries = data?.entries ?? []

  // TODO: Move this to a hook
  let pending = BigNumber.from(0)
  let available = BigNumber.from(0)
  let lastId = BigNumber.from(0)

  for (const entry of entries) {
    const amount = BigNumber.from(entry.amount)

    if (Number(entry.availableAt) > blockNumber) {
      pending = pending.add(amount)
    } else {
      lastId = BigNumber.from(entry.draftId)
      available = available.add(amount)
    }
  }

  const handleWithdraw = () => {
    loadTransactions(dispatch, [
      {
        autoCall: true,
        description: `Withdraw ${formatEther(pending)}`,
        status: TX_STATUS.PENDING,
        value: formatEther(pending),
        call: {
          abi: StRSRInterface,
          address: data.insurance?.token?.address as string,
          method: 'withdraw',
          args: [account, lastId.add(BigNumber.from(1))],
        },
      },
    ])
  }

  return (
    <>
      <Card p={3} {...props}>
        <Flex mb={2} sx={{ alignItems: 'center' }}>
          <Box>
            <Text variant="contentTitle" sx={{ fontSize: 2 }}>
              Available
            </Text>
            <Text>
              {formatCurrency(
                available.div(BigNumber.from(10).pow(18)).toNumber()
              )}{' '}
              RSR
            </Text>
          </Box>
          {!available.isZero() && (
            <Button
              ml={3}
              sx={{
                height: '34px',
                paddingLeft: '8px',
                paddingRight: '8px',
                fontSize: 1,
              }}
              onClick={handleWithdraw}
            >
              Withdraw
            </Button>
          )}
        </Flex>
        <Divider sx={{ borderColor: '#DFDFDF' }} />
        <Box>
          <Text variant="contentTitle" sx={{ fontSize: 2 }}>
            Pending
          </Text>
          <Text
            onClick={() => setVisible(true)}
            as="a"
            sx={
              !pending.isZero()
                ? {
                    borderBottom: '1px solid black',
                    cursor: 'pointer',
                    '&:hover': { color: '#ccc', borderColor: '#ccc' },
                  }
                : {}
            }
          >
            {formatCurrency(pending.div(BigNumber.from(10).pow(18)).toNumber())}{' '}
            RSR
          </Text>
        </Box>
        {entries.length > 0 && (
          <Box
            mt={3}
            p={2}
            sx={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <Text variant="contentTitle" sx={{ fontSize: '12px' }}>
              All funds will be available to be withdraw at block{' '}
              {entries[entries.length - 1].availableAt}
            </Text>
          </Box>
        )}
      </Card>
      <Modal
        open={visible}
        onClose={() => setVisible(false)}
        title="Pending Withdrawals"
      >
        <Table
          columns={columns}
          data={entries.filter(
            (entry: any) => Number(entry.availableAt) > blockNumber
          )}
        />
      </Modal>
    </>
  )
}

export default Withdrawals
