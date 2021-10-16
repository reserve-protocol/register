import { utils } from 'ethers'
import { Card } from 'components'
import { Flex, Grid, Text } from 'theme-ui'
import {
  IReserveToken,
  IBasketToken,
  selectBasket,
} from 'state/reserve-tokens/reducer'
import { useEthers, useTokenBalance } from '@usedapp/core'
import RTokenIcon from 'components/icons/logos/RTokenIcon'
import { useSelector } from 'react-redux'

const BasketToken = ({ data }: { data: IBasketToken }) => {
  const { account } = useEthers()
  const balance = useTokenBalance(data.address, account)

  return (
    <Flex sx={{ flexDirection: 'column' }}>
      <Text sx={{ fontSize: 3, fontWeight: 'bold' }}>{data.symbol}</Text>
      <Text sx={{ fontSize: 2 }}>
        $ {balance ? utils.formatEther(balance) : ''}
      </Text>
    </Flex>
  )
}

const Overview = ({ data }: { data: IReserveToken }) => {
  const { account } = useEthers()
  const balance = useTokenBalance(data.address, account)
  const baskets = useSelector(selectBasket)

  return (
    <>
      <Grid columns={2} mb={3}>
        <Card>
          <Flex sx={{ alignItems: 'center' }}>
            <RTokenIcon style={{ fontSize: 32, marginRight: '1rem' }} />
            <Text sx={{ fontSize: 4, fontWeight: 'bold' }}>{data.symbol}</Text>
            <Text sx={{ marginLeft: 'auto', fontSize: 3 }}>
              $ {balance ? utils.formatEther(balance) : ''}
            </Text>
          </Flex>
        </Card>
        <Card sx={{ display: 'flex', alignItems: 'center' }}>
          <Text>Use this space for something...</Text>
        </Card>
      </Grid>
      <Card title="Collaterals" mb={3}>
        <Grid gap={4} columns={data.basketSize}>
          {baskets.map((token) => (
            <BasketToken data={token} key={token.address} />
          ))}
        </Grid>
      </Card>
    </>
  )
}

export default Overview
