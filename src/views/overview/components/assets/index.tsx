import { Box, Grid, Text } from '@theme-ui/components'
import { Card } from 'components'
import InfoBox from 'components/info-box'
import { formatEther } from 'ethers/lib/utils'
import useTokenSupply from 'hooks/useTokenSupply'
import { useEffect, useState } from 'react'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'

/**
 * RToken Assets overview
 * Display the market cap of the current RToken and the ratio between the RToken and their vault collaterals
 *
 * @prop data: ReserveToken
 * @returns React.Component
 */
const AssetsOverview = ({
  data: { token, vault },
  isRSV,
  ...props
}: {
  data: ReserveToken
  isRSV?: boolean
}) => {
  // TODO: For RTokens consult this from the explorer view contract
  // TODO: More than the expected basket tokens could be returned
  const [collaterals, setCollaterals] = useState(
    vault.collaterals.map((collateral) => ({
      name: collateral.token.name,
      decimals: collateral.token.decimals,
      symbol: collateral.token.symbol,
      index: collateral.index,
      address: collateral.token.address,
      value: '0.00',
    }))
  )
  const marketCap = useTokenSupply(token.address)

  useEffect(() => {
    if (marketCap) {
      if (isRSV) {
        const distribution = formatCurrency(
          parseFloat(formatEther(marketCap.div(3)))
        )
        setCollaterals(
          collaterals.map((collateral) => ({
            ...collateral,
            value: distribution,
          }))
        )
      }
    }
  }, [marketCap])

  return (
    <Box {...props}>
      <Text sx={{ fontSize: 4, display: 'block' }} mb={2}>
        Assets
      </Text>
      <Card p={4}>
        <InfoBox
          title={`${
            marketCap
              ? formatCurrency(parseFloat(formatEther(marketCap)))
              : '0.00'
          } ${token.symbol}`}
          subtitle="In circulation"
        />
      </Card>
      <Grid columns={3} gap={0} mb={5}>
        {collaterals.map((collateral) => (
          <Card key={collateral.address}>
            <InfoBox title={collateral.value} subtitle={collateral.name} />
          </Card>
        ))}
      </Grid>
    </Box>
  )
}

export default AssetsOverview
