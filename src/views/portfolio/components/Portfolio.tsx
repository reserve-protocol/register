import { Trans } from '@lingui/macro'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import ChainLogo from 'components/icons/ChainLogo'
import PositionIcon from 'components/icons/PositionIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  accountHoldingsAtom,
  accountTokensAtom,
  rsrPriceAtom,
  walletAtom,
} from 'state/atoms'
import { AccountRTokenPosition } from 'state/wallet/updaters/AccountUpdater'
import { Box, BoxProps, Card, Grid, Text } from 'theme-ui'
import { formatCurrency, getTokenRoute } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import { supportedChainList } from 'utils/constants'
import { useBalance } from 'wagmi'

const PortfolioToken = ({ position }: { position: AccountRTokenPosition }) => {
  const logo = useRTokenLogo(position.address, position.chain)
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(getTokenRoute(position.address, position.chain))
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
      p={4}
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
        <ChainLogo chain={position.chain} />
      </Box>
    </Grid>
  )
}

const AccountRSR = ({ chain }: { chain: number }) => {
  const wallet = useAtomValue(walletAtom) || '0x'
  const rsrPrice = useAtomValue(rsrPriceAtom)

  const { data } = useBalance({
    token: RSR_ADDRESS[chain],
    address: wallet,
    chainId: chain,
  })

  return (
    <Box variant="layout.verticalAlign">
      <Box sx={{ position: 'relative' }}>
        <TokenLogo width={24} symbol="rsr" bordered chain={chain} />
      </Box>
      <Box ml={3}>
        <Text variant="strong">
          {formatCurrency(Number(data?.formatted ?? 0))} RSR
        </Text>
        <Text sx={{ fontSize: 1 }} variant="legend">
          ${formatCurrency(Number(data?.formatted ?? 0) * rsrPrice)}
        </Text>
      </Box>
    </Box>
  )
}

const Portfolio = (props: BoxProps) => {
  const rTokens = useAtomValue(accountTokensAtom)
  const wallet = useAtomValue(walletAtom)
  const holdings = useAtomValue(accountHoldingsAtom)
  const { openConnectModal } = useConnectModal()

  if (!wallet) {
    return (
      <Box mx={[1, 0]}>
        <Text ml={5} mb={4} variant="sectionTitle">
          <Trans>Portfolio</Trans>
        </Text>
        <Card
          onClick={openConnectModal}
          py={6}
          sx={{
            border: '2px dashed',
            borderColor: 'darkBorder',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <LogIn size={32} />

          <Text mt={3} sx={{ display: 'block' }}>
            <Trans>Please connect your wallet</Trans>
          </Text>
        </Card>
      </Box>
    )
  }

  return (
    <Box
      {...props} /* sx={{border: '1px dashed',  borderColor: 'primary', borderRadius: 12}}*/
    >
      <Box>
        <Box ml={4}>
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
          <Box mt={2} variant="layout.verticalAlign">
            {supportedChainList.map((chain) => (
              <Box key={chain} variant="layout.verticalAlign" mr={3}>
                <Text mr={3} sx={{ fontSize: 4 }}>
                  +
                </Text>
                <AccountRSR chain={chain} />
              </Box>
            ))}
          </Box>
        </Box>
        {rTokens?.length > 0 && (
          <Box mt={[4, 5]}>
            <Text
              pl={4}
              mb={[3, 0]}
              variant="title"
              sx={{ color: 'secondaryText', fontWeight: '400' }}
            >
              <Trans>Your RTokens</Trans>
            </Text>
            <Grid
              columns="1fr 1fr 1fr 1fr"
              p={4}
              sx={{ display: ['none', 'grid'] }}
            >
              <Text variant="strong">Token</Text>
              <Text variant="legend">USD value</Text>
              <Text variant="legend">
                <Trans>Your staked RSR</Trans>
              </Text>
              <Box></Box>
            </Grid>
            <Box mt={-3}>
              {rTokens.map((position) => (
                <PortfolioToken key={position.address} position={position} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default Portfolio
