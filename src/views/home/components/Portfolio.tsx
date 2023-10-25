import { Trans } from '@lingui/macro'
import PositionIcon from 'components/icons/PositionIcon'
import TokenLogo from 'components/icons/TokenLogo'
import Base from 'components/icons/logos/Base'
import Ethereum from 'components/icons/logos/Ethereum'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { localeAtom } from 'i18n'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { accountHoldingsAtom, accountTokensAtom } from 'state/atoms'
import { AccountRTokenPosition } from 'state/wallet/updaters/AccountUpdater'
import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ChainId } from 'utils/chains'

export const chainIcons = {
  [ChainId.Mainnet]: Ethereum,
  [ChainId.Base]: Base,
}

const PortfolioToken = ({ position }: { position: AccountRTokenPosition }) => {
  const logo = useRTokenLogo(position.address)
  const Logo = chainIcons[position.chain]
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/overview?token=${position.address}`)
    document.getElementById('app-container')?.scrollTo(0, 0)
    mixpanel.track('Selected RToken', {
      Source: 'Portfolio Table',
      RToken: position.address,
    })
  }

  return (
    <Grid
      columns={['1fr', '1fr 1fr 1fr 1fr']}
      sx={{
        backgroundColor: 'contentBackground',
        position: 'relative',
        borderRadius: 20,
        cursor: 'pointer',
      }}
      onClick={handleClick}
      mt={3}
      p={3}
    >
      <Box variant="layout.verticalAlign">
        <TokenLogo width={24} mr={2} src={logo} />
        <Text ml={1} variant="strong">
          {formatCurrency(+position.balance)} {position.symbol}
        </Text>
      </Box>

      <Box variant="layout.verticalAlign" sx={{ display: ['none', 'flex'] }}>
        <Text mr="2" variant="strong">
          =
        </Text>
        <Text variant="legend">${formatCurrency(+position.usdAmount)}</Text>
      </Box>

      <Box sx={{ flexWrap: 'wrap' }} ml={[5, 0]} variant="layout.verticalAlign">
        <Box variant="layout.verticalAlign">
          <PositionIcon />
          <Text sx={{ whiteSpace: 'nowrap' }} ml="2">
            {formatCurrency(position.stakedRSR)} RSR
          </Text>
        </Box>

        <Text ml="2" variant="legend">
          (${formatCurrency(+position.stakedRSRUsd)})
        </Text>
      </Box>
      <Box
        sx={{
          textAlign: 'right',
          position: ['absolute', 'relative'],
          right: 20,
          top: 'calc(50% - 10px)',
        }}
      >
        <Logo />
      </Box>
    </Grid>
  )
}

const Portfolio = (props: BoxProps) => {
  const lang = useAtomValue(localeAtom)
  const rTokens = useAtomValue(accountTokensAtom)
  const holdings = useAtomValue(accountHoldingsAtom)
  const navigate = useNavigate()

  const rTokenColumns = useMemo(
    () => [
      {
        accessor: 'symbol',
        maxWidth: 250,
        Cell: (data: any) => {
          const logo = useRTokenLogo(data.row.original.address)

          return (
            <Box variant="layout.verticalAlign">
              <TokenLogo width={24} mr={2} src={logo} />
              <Text ml={1} variant="strong">
                {formatCurrency(+data.row.original.balance)}{' '}
                {data.row.original.symbol}
              </Text>
            </Box>
          )
        },
      },
      {
        accessor: 'usdAmount',
        Cell: (data: any) => {
          return (
            <Box
              variant="layout.verticalAlign"
              sx={{ display: ['none', 'flex'] }}
            >
              <Text mr="2" variant="strong">
                =
              </Text>
              <Text variant="legend">${formatCurrency(+data.cell.value)}</Text>
            </Box>
          )
        },
      },
      {
        accessor: 'stakedRSR',
        Cell: (data: any) => {
          return (
            <Box sx={{ flexWrap: 'wrap' }} variant="layout.verticalAlign">
              <Box variant="layout.verticalAlign">
                <PositionIcon />
                <Text sx={{ whiteSpace: 'nowrap' }} ml="2">
                  {formatCurrency(data.cell.value)} RSR
                </Text>
              </Box>

              <Text ml="2" variant="legend">
                (${formatCurrency(+data.row.original.stakedRSRUsd)})
              </Text>
            </Box>
          )
        },
      },
      {
        accessor: 'chain',
        Cell: ({ cell }: { cell: any }) => {
          const Logo = chainIcons[cell.value]

          return (
            <Box sx={{ textAlign: 'right' }}>
              <Logo />
            </Box>
          )
        },
      },
    ],
    [lang]
  )

  if (!holdings) {
    return null
  }

  const handleClick = (data: any) => {
    navigate(`/overview?token=${data.address}`)
    document.getElementById('app-container')?.scrollTo(0, 0)
    mixpanel.track('Selected RToken', {
      Source: 'Portfolio Table',
      RToken: data.address,
    })
  }

  return (
    <Box
      {...props} /* sx={{border: '1px dashed',  borderColor: 'primary', borderRadius: 12}}*/
    >
      <Box>
        <Box ml={3}>
          <Text mb={1} variant="title" sx={{ color: 'secondaryText' }}>
            <Trans>Wallet staked RSR + RToken Value</Trans>
          </Text>
          <Text
            ml={[0, '-1px']}
            sx={{ fontSize: [4, 7], fontWeight: 400, color: 'text' }}
            as="h1"
          >
            ${formatCurrency(holdings)}
          </Text>
        </Box>
        <Box>
          {rTokens?.length > 0 && (
            <Box mt={[4, 5]}>
              <Text
                pl={3}
                variant="title"
                sx={{ color: 'secondaryText', fontWeight: '400' }}
              >
                <Trans>Your RTokens</Trans>
              </Text>
              <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                {rTokens.map((position) => (
                  <PortfolioToken position={position} />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Divider mx={[-1, 0]} my={[5, 8]} />
    </Box>
  )
}

export default Portfolio
