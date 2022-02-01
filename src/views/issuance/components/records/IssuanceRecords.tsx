import { gql, useQuery } from '@apollo/client'
import styled from '@emotion/styled'
import { Box, Flex, Text } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import TransactionHistory from 'components/transaction-history'
import { useState } from 'react'
import PendingIssuances from './pending'

const GET_TX_HISTORY = gql`
  query GetIssuancesHistory($userId: String!) {
    entries(
      user: $userId
      where: { type_in: ["Issuance", "Redemption"] }
      orderBy: createdAt
      orderDirection: desc
    ) {
      id
      type
      amount
      createdAt
      transaction {
        id
      }
    }
  }
`

const TabTitle = styled(Text)`
  font-weight: 500;
  font-size: 20px;
  padding: 10px 15px;
  border-radius: 3px;
  border: ${({ defaultChecked }) =>
    defaultChecked ? '1px solid black' : 'none'};
  color: ${({ defaultChecked }) => (defaultChecked ? 'inherit' : '#CBCBCB')};
  cursor: ${({ defaultChecked }) => (defaultChecked ? 'inherit' : 'pointer')};
`

const IssuanceRecords = () => {
  // This component is protected by a guard, RToken always exists
  const { account } = useEthers()
  const { data, loading } = useQuery(GET_TX_HISTORY, {
    variables: {
      where: {},
      userId: account,
    },
  })
  const [current, setCurrent] = useState(0)

  const handleChange = (index: number) => {
    setCurrent(index)
  }

  return (
    <Box>
      <Flex mb={4}>
        <TabTitle
          defaultChecked={current === 0}
          onClick={() => handleChange(0)}
          mr={3}
        >
          Transactions
        </TabTitle>
        <TabTitle
          defaultChecked={current === 1}
          onClick={() => handleChange(1)}
        >
          Pending Issuance
        </TabTitle>
      </Flex>
      {current === 0 ? (
        <TransactionHistory
          history={data && data.entries ? data.entries : []}
        />
      ) : (
        <PendingIssuances />
      )}
    </Box>
  )
}

export default IssuanceRecords
