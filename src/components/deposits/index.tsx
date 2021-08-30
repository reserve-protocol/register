import styled from 'styled-components'
import { gql, useQuery } from '@apollo/client'
import { Card } from '@shopify/polaris'
import { BigNumber } from 'ethers'

const QUERY = gql`
  query GetDeposits {
    deposits {
      id
      user {
        id
      }
      value
      createdAt
      completedAt
      createdTx {
        hash
      }
      completed
    }
  }
`

const Item = styled.div`
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
`

type Deposit = {
  id: string
  user: string
  value: BigNumber
  createdAt: number
  createdTx: object
  completedAt: number
  completedTx: object
  completed: boolean
}

const DepositItem = ({ data }: { data: Deposit }) => (
  <Item>
    <code>{JSON.stringify(data, null, 4)}</code>
  </Item>
)

const Deposits = () => {
  const { data, error, loading } = useQuery(QUERY, {
    variables: { orderBy: 'id', where: {} },
  })

  return (
    <Card title="Deposits" sectioned>
      {loading && <span>Loading deposits...</span>}
      <div style={{ maxHeight: 500, overflow: 'scroll' }}>
        {!!data &&
          data.deposits.map((deposit: Deposit) => (
            <DepositItem key={deposit.id} data={deposit} />
          ))}
      </div>
    </Card>
  )
}

export default Deposits
