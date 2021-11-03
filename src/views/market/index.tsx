import { Card } from 'components'
import { Table } from 'components/table'
import { useState, useEffect } from 'react'
import Container from '../../components/container'

const columns: any[] = [
  { Header: 'Token', accessor: 'name' },
  { Header: 'Price', accessor: 'current_price' },
  { Header: 'Change (%)', accessor: 'price_change_percentage_24h' },
  { Header: 'Volume (24h)', accessor: 'total_volume' },
  { Header: 'Market Cap', accessor: 'market_cap' },
]

const Market = () => {
  const [tokens, setTokens] = useState([])

  useEffect(() => {
    const getTokens = async () => {
      const result = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false'
      ).then((req) => req.json())

      setTokens(result)
    }

    getTokens()
  }, [])

  return (
    <Container py={4}>
      <Card title="Market">
        <Table columns={columns} data={tokens} pagination />
      </Card>
    </Container>
  )
}

export default Market
