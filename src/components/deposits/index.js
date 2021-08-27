import styled from 'styled-components'
import { gql, useQuery } from '@apollo/client'
import { Card } from '@shopify/polaris'

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

const DepositItem = ({ data }) => (
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
          data.deposits.map((deposit) => (
            <DepositItem key={deposit.id} data={deposit} />
          ))}
      </div>
    </Card>
  )
}

export default Deposits
