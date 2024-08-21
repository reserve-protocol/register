import { Trans } from '@lingui/macro'
import { Button } from 'components'
import CopyValue from 'components/button/CopyValue'
import GoTo from 'components/button/GoTo'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import HiperlinkIcon from 'components/icons/HiperlinkIcon'
import TokenLogo from 'components/icons/TokenLogo'
import TabMenu from 'components/tab-menu'
import useRToken from 'hooks/useRToken'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { ChevronDown } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { chainIdAtom } from 'state/atoms'
import { collateralsMetadataAtom } from 'state/cms/atoms'
import {
  CollateralDetail,
  rTokenCollateralDetailedAtom,
} from 'state/rtoken/atoms/rTokenBackingDistributionAtom'
import { Box, Card, Flex, Grid, Text } from 'theme-ui'
import { formatCurrency, shortenAddress } from 'utils'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import VerticalDivider from 'views/compare/components/VerticalDivider'

interface DetailedCollateralWithMeta extends CollateralDetail {
  website?: string
  description: string
  addresses: { label: string; address: string }[]
}

const backingTypeAtom = atom('total')
const backingDetailAtom = atom((get) => {
  const collaterals = get(rTokenCollateralDetailedAtom)
  const metadata = get(collateralsMetadataAtom)
  const chainId = get(chainIdAtom)

  if (!collaterals) {
    return null
  }

  return collaterals.map((c) => {
    const meta = metadata?.[c.symbol.toLowerCase().replace('-vault', '')]
    // TODO: Define multitoken case
    const token = meta?.underlying?.[0]
    const addresses = [{ label: 'Collateral', address: c.address }]

    if (token && token.addresses[chainId]) {
      addresses.push({ label: 'Token', address: token.addresses[chainId] })
    }

    return {
      ...c,
      website: token?.website,
      description: meta?.description ?? '',
      addresses,
    }
  }) as DetailedCollateralWithMeta[]
})

const CollateralDetails = ({
  collateral,
}: {
  collateral: DetailedCollateralWithMeta
}) => {
  const chainId = useAtomValue(chainIdAtom)
  const [expanded, setExpanded] = useState(false)
  const backingType = useAtomValue(backingTypeAtom)
  const usdValueLabelProps = collateral.valueTarget
    ? {
        variant: 'legend',
        sx: { fontWeight: 400 },
      }
    : {}

  return (
    <Box
      p={[3, 4]}
      sx={{
        fontWeight: 700,
        cursor: 'pointer',
        position: 'relative',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: expanded ? 'inputBorder' : 'border',
        ':last-of-type': { borderBottom: 'none' },
        '&:hover': { backgroundColor: ['none', 'inputBackground'] },
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <Grid columns={['1fr', '3fr 1fr 1fr 1fr']}>
        <Box variant="layout.verticalAlign">
          <TokenLogo symbol={collateral.symbol} />
          <Text ml={2} variant="accent">
            {collateral.distribution.toFixed(2)}%
          </Text>
          <Text ml="2">{collateral.displayName}</Text>
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
      </Grid>
      {!!expanded && (
        <Box mt={3} sx={{ fontWeight: 400 }}>
          <Text as="p">{collateral.description}</Text>
          <Box mt="3" variant="layout.verticalAlign" sx={{ flexWrap: 'wrap' }}>
            <Button
              mr="3"
              small
              variant="transparent"
              onClick={() =>
                window.open(
                  'https://reserve.org/protocol/introduction/',
                  '_blank'
                )
              }
            >
              <Box variant="layout.verticalAlign">
                <HiperlinkIcon />
                <Text ml="2">Docs</Text>
              </Box>
            </Button>
            {!!collateral.website && (
              <Button
                mr="3"
                small
                variant="bordered"
                onClick={() => window.open(collateral.website, '_blank')}
              >
                <Box variant="layout.verticalAlign">
                  <HiperlinkIcon />
                  <Text ml="2">Website</Text>
                </Box>
              </Button>
            )}
            <VerticalDivider mr="3" sx={{ display: ['none', 'block'] }} />
            <Box
              variant="layout.verticalAlign"
              sx={{ flexBasis: ['100%', 'auto'], mt: [3, 0] }}
            >
              <Text mr={2} variant="legend">
                {shortenAddress(collateral.address)}
              </Text>
              <CopyValue mr={1} ml="auto" value={collateral.address} />
              <GoTo
                style={{ position: 'relative', top: '2px' }}
                href={getExplorerLink(
                  collateral.address,
                  chainId,
                  ExplorerDataType.TOKEN
                )}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

const CollateralList = () => {
  const collaterals = useAtomValue(backingDetailAtom)

  if (!collaterals) {
    return (
      <Box px={4} mb={3}>
        <Skeleton count={3} height={66} />
      </Box>
    )
  }

  return (
    <Box>
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
      p={[3, 4]}
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
        mt={[2, 0]}
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
        columns={'3fr 1fr 1fr 1fr'}
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
