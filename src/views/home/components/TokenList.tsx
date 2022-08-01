import { t } from '@lingui/macro'
import { ContentHead } from 'components/info-box'
import { Table } from 'components/table'
import { useMemo } from 'react'
import { Box, BoxProps } from 'theme-ui'
import tokenList from 'rtokens'

const mockTokens: any = [
  { name: 'USD1', price: '$1.00', balance: '0.00', value: '0.00', apy: '0.00' },
  {
    name: 'USD1',
    price: '$1.00',
    balance: '0.00',
    value: '$1,308.38',
    apy: '3.05',
  },
]

const TokenList = (props: BoxProps) => {
  const rTokenColumns = useMemo(
    () => [
      { Header: 'RToken', accessor: 'name' },
      { Header: 'Price', accessor: 'price' },
      { Header: 'Balance', accessor: 'balance' },
      { Header: 'Value', accessor: 'value' },
      { Header: 'APY', accessor: 'apy' },
    ],
    []
  )
  return (
    <Box {...props}>
      <ContentHead
        title={t`Compare RTokens`}
        subtitle={t`Including off-chain in-app transactions of RToken in the Reserve App.`}
      />
      <Table mt={3} columns={rTokenColumns} data={mockTokens} />
    </Box>
  )
}

export default TokenList
