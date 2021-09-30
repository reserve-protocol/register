import { IBasketToken, IRTokenInfo } from 'hooks/useRToken'
import { utils } from 'ethers'
import { Card } from 'components'

const BasketToken = ({ data }: { data: IBasketToken }) => (
  <div>
    <b>Name: </b> {data.name} | <b>Symbol: </b> {data.symbol} | <b>Balance: </b>{' '}
    {data.balance ? utils.formatEther(data.balance) : ''}
  </div>
)

const Overview = ({ data }: { data: IRTokenInfo }) => (
  <Card title="RToken info" mb={3}>
    <b>Symbol: </b> {data.symbol}
    <br />
    <b>Balance: </b> {data.balance ? utils.formatEther(data.balance) : ''}
    <br />
    <h3>
      <b>Basket Tokens</b>
    </h3>
    {(data?.basket || []).map((token) => (
      <BasketToken key={token.address} data={token} />
    ))}
  </Card>
)

export default Overview
