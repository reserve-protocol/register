import { Trans } from '@lingui/macro'
import ERC20 from 'abis/ERC20'
import PositionIcon from 'components/icons/PositionIcon'
import TokenLogo from 'components/icons/TokenLogo'
import Base from 'components/icons/logos/Base'
import Ethereum from 'components/icons/logos/Ethereum'
import useRTokenLogo from 'hooks/useRTokenLogo'
import { atom, useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useNavigate } from 'react-router-dom'
import { accountHoldingsAtom, accountTokensAtom, walletAtom } from 'state/atoms'
import { publicClient } from 'state/chain'
import { AccountRTokenPosition } from 'state/wallet/updaters/AccountUpdater'
import { Box, BoxProps, Divider, Grid, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { RSR_ADDRESS } from 'utils/addresses'
import { atomWithLoadable } from 'utils/atoms/utils'
import { ChainId } from 'utils/chains'
import { useBalance, useContractRead } from 'wagmi'

export const chainIcons = {
  [ChainId.Mainnet]: Ethereum,
  [ChainId.Base]: Base,
}

const PortfolioToken = ({ position }: { position: AccountRTokenPosition }) => {
  const logo = useRTokenLogo(position.address)
  const Logo = chainIcons[position.chain]
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/overview?token=${position.address}&chainId=${position.chain}`)
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
        <Logo />
      </Box>
    </Grid>
  )
}

const multichainRead = async (data: any) => {
  const mainnetClient = publicClient({ chainId: ChainId.Mainnet })
  const baseClient = publicClient({ chainId: ChainId.Base })
}

const AccountRSRHoldingsAtom = atomWithLoadable((get) => {
  const wallet = get(walletAtom)

  if (!wallet) {
    return null
  }

  const mainnetClient = publicClient({ chainId: 1 })
  const baseClient = publicClient({ chainId: 1 })

  // console.log('client', client)

  return {}
})

const AccountRSR = () => {
  const wallet = useAtomValue(walletAtom) || '0x'
  console.log('wallet?', wallet)
  const holdings = useAtomValue(AccountRSRHoldingsAtom)

  const balance = useContractRead({
    abi: ERC20,
    address: RSR_ADDRESS[ChainId.Mainnet],
    functionName: 'balanceOf',
    args: [wallet],
    chainId: ChainId.Mainnet,
  })
  const balanceBase = useContractRead({
    abi: ERC20,
    address: RSR_ADDRESS[ChainId.Base],
    functionName: 'balanceOf',
    args: [wallet],
    chainId: ChainId.Base,
  })

  console.log('balance', balance)
  console.log('balance base', balanceBase)

  return (
    <Box variant="layout.verticalAlign">
      <Box sx={{ position: 'relative' }}>
        <TokenLogo width={24} symbol="rsr" bordered chain={1} />
        {/* <Box sx={{ position: 'absolute', right: '-3px', bottom: '-10px' }}>
          <Base width={10} height={10} />
        </Box> */}
      </Box>
      <Box ml={3}>
        <Text variant="strong">1 RSR</Text>
        <Text sx={{ fontSize: 1 }} variant="legend">
          $4
        </Text>
      </Box>
    </Box>
  )
}

const Portfolio = (props: BoxProps) => {
  const rTokens = useAtomValue(accountTokensAtom)
  const wallet = useAtomValue(walletAtom)
  const holdings = useAtomValue(accountHoldingsAtom)

  if (!wallet) {
    return null
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
          <Box variant="layout.verticalAlign">
            <Text>+</Text>
            <AccountRSR />
          </Box>
        </Box>

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
                <PortfolioToken key={position.address} position={position} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
      <Divider mx={[-1, 0]} my={[5, 8]} />
    </Box>
  )
}

export default Portfolio
