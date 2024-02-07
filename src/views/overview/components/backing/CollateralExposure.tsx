import { Trans } from '@lingui/macro'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import TokenLogo from 'components/icons/TokenLogo'
import TabMenu from 'components/tab-menu'
import useRToken from 'hooks/useRToken'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { ChevronDown } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import {
  collateralYieldAtom,
  rTokenAtom,
  rTokenBackingDistributionAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { Box, Card, Grid, Text } from 'theme-ui'
import { Token } from 'types'
import { formatCurrency, truncateDecimals } from 'utils'

interface CollateralDetail extends Token {
  yield: string
  value: number
  distribution: string
}

const backingTypeAtom = atom('total')

const collateralsAtom = atom((get) => {
  const rToken = get(rTokenAtom)
  const backingType = get(backingTypeAtom)
  const supply = get(rTokenStateAtom)?.tokenSupply
  const price = get(rTokenPriceAtom)
  const distribution = get(
    rTokenBackingDistributionAtom
  )?.collateralDistribution
  const yields = get(collateralYieldAtom)

  if (!rToken || !distribution || !supply || !Object.keys(yields).length) {
    return null
  }

  const valueCalc = backingType === 'total' ? (supply ? supply * price : 0) : 1

  return rToken.collaterals.map((collateral) => {
    return {
      ...collateral,
      yield: (yields[collateral.symbol.toLowerCase()] || 0).toFixed(2),
      value: (valueCalc * distribution[collateral.address].share) / 100,
      distribution: distribution[collateral.address].share.toFixed(2),
    }
  }) as CollateralDetail[]
})

const CollateralDetails = ({
  collateral,
}: {
  collateral: CollateralDetail
}) => {
  return (
    <Grid columns="2fr 1fr 1fr 1fr" py={4} px={4}>
      <Box variant="layout.verticalAlign" sx={{ fontWeight: 700 }}>
        <TokenLogo symbol={collateral.symbol} />
        <Text ml={2}>{collateral.distribution}%</Text>
        <Text ml="2">{collateral.symbol}</Text>
      </Box>
      <Text>{collateral.yield}%</Text>
      <Text>${formatCurrency(collateral.value)}</Text>
      <Box sx={{ textAlign: 'right' }}>
        <ChevronDown size={16} />
      </Box>
    </Grid>
  )
}

const CollateralList = () => {
  const collaterals = useAtomValue(collateralsAtom)

  if (!collaterals) {
    return (
      <Box px={4}>
        <Skeleton count={3} height={66} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        '>div': {
          borderBottom: '1px solid',
          borderColor: 'border',
          ':last-of-type': { borderBottom: 'none' },
        },
      }}
    >
      {collaterals.map((collateral) => (
        <CollateralDetails key={collateral.address} collateral={collateral} />
      ))}
    </Box>
  )
}

const Header = () => {
  const [backingType, setBackingType] = useAtom(backingTypeAtom)
  const rToken = useRToken()

  const backingOptions = useMemo(
    () => [
      { key: 'total', label: 'Total backing' },
      { key: 'unit', label: `1 ${rToken?.symbol}` },
    ],
    [rToken]
  )

  return (
    <Box
      variant="layout.verticalAlign"
      p={4}
      sx={{ borderBottom: '1px solid', borderColor: 'border' }}
    >
      <CollaterizationIcon width={20} height={20} />
      <Text ml="2" mr="auto" sx={{ fontSize: 3, fontWeight: 700 }}>
        <Trans>Collateral Exposure</Trans>
      </Text>
      <TabMenu
        active={backingType}
        items={backingOptions}
        small
        background="border"
        onMenuChange={setBackingType}
      />
    </Box>
  )
}

const CollateralExposure = () => {
  return (
    <Card variant="inner">
      <Header />
      <Grid
        columns="2fr 1fr 1fr 1fr"
        py="10px"
        px={4}
        sx={{ display: ['none', 'grid'], color: 'secondaryText', fontSize: 1 }}
      >
        <Text>Token</Text>
        <Text>Yield</Text>
        <Text>Value</Text>
        <Text sx={{ textAlign: 'right' }}>Detail</Text>
      </Grid>
      <CollateralList />
    </Card>
  )
}

export default CollateralExposure
