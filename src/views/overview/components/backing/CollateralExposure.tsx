import { Trans } from '@lingui/macro'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import TokenLogo from 'components/icons/TokenLogo'
import TabMenu from 'components/tab-menu'
import useRToken from 'hooks/useRToken'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { ChevronDown } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import {
  CollateralDetail,
  rTokenCollateralDetailedAtom,
} from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { Box, Card, Flex, Grid, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { TARGET_UNITS } from 'utils/constants'

const backingTypeAtom = atom('total')

const CollateralDetails = ({
  collateral,
}: {
  collateral: CollateralDetail
}) => {
  const [expanded, setExpanded] = useState(false)
  const backingType = useAtomValue(backingTypeAtom)
  const usdValueLabelProps = collateral.valueTarget
    ? {
        variant: 'legend',
        sx: { fontWeight: 400 },
      }
    : {}

  return (
    <>
      <Grid
        columns={['1fr', '2fr 1fr 1fr 1fr']}
        py={4}
        px={4}
        sx={{
          fontWeight: 700,
          cursor: 'pointer',
          position: 'relative',
          alignItems: 'center',
          backgroundColor: expanded ? 'border' : '',
          '&:hover': { backgroundColor: 'border' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box variant="layout.verticalAlign">
          <TokenLogo symbol={collateral.symbol} />
          <Text ml={2} variant="accent">
            {collateral.distribution.toFixed(2)}%
          </Text>
          <Text ml="2">{collateral.symbol}</Text>
        </Box>
        <Box>
          <Text variant="strong" sx={{ display: ['inline', 'none'] }}>
            Yield:{' '}
          </Text>
          <Text>{collateral.yield.toFixed(2)}%</Text>
        </Box>

        <Flex sx={{ flexWrap: 'wrap' }}>
          <Text mr="1" variant="strong" sx={{ display: ['inline', 'none'] }}>
            Value:
          </Text>
          {!!collateral.valueTarget && !!collateral.valueSingleTarget && (
            <Text mr="2" sx={{ whiteSpace: 'nowrap' }}>
              {formatCurrency(
                backingType === 'total'
                  ? collateral.valueTarget
                  : collateral.valueSingleTarget
              )}{' '}
              {collateral.targetUnit}
            </Text>
          )}
          <Text {...usdValueLabelProps}>
            {!!collateral.valueTarget && '('}$
            {formatCurrency(
              backingType === 'total'
                ? collateral.valueUsd
                : collateral.valueSingleUsd
            )}
            {!!collateral.valueTarget && ')'}
          </Text>
        </Flex>

        <Box
          sx={{
            textAlign: 'right',
            position: ['absolute', 'relative'],
            top: [68, 0],
            right: [20, 0],
          }}
        >
          <ChevronDown size={16} />
        </Box>
        {!!expanded && <Box sx={{ fontWeight: 400 }}>expanded</Box>}
      </Grid>
    </>
  )
}

const CollateralList = () => {
  const collaterals = useAtomValue(rTokenCollateralDetailedAtom)

  if (!collaterals) {
    return (
      <Box px={4} mb={3}>
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
      sx={{
        borderBottom: '1px solid',
        borderColor: 'border',
        flexWrap: 'wrap',
      }}
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
    <Card variant="inner" sx={{ height: 'fit-content' }}>
      <Header />
      <Grid
        columns={'2fr 1fr 1fr 1fr'}
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
