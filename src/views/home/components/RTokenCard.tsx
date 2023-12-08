import { Trans } from '@lingui/macro'
import { Button } from 'components'
import ChainLogo from 'components/icons/ChainLogo'
import CollaterizationIcon from 'components/icons/CollaterizationIcon'
import TokenLogo from 'components/icons/TokenLogo'
import { ListedToken } from 'hooks/useTokenList'
import { memo } from 'react'
import { ArrowRight } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { useNavigate } from 'react-router-dom'
import { borderRadius } from 'theme'
import { Box, BoxProps, Card, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { CHAIN_TAGS, ROUTES } from 'utils/constants'

interface Props extends BoxProps {
  token: ListedToken
}

const ChainBadge = ({ chain }: { chain: number }) => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      position: 'absolute',
      right: 0,
      top: 0,
      border: '2px dashed',
      borderColor: 'darkBorder',
      backgroundColor: 'background',
      borderRadius: borderRadius.boxes,
    }}
    p={2}
  >
    <ChainLogo chain={chain} />
    <Text ml="2">{CHAIN_TAGS[chain]}</Text>
  </Box>
)

const RTokenCard = ({ token, ...props }: Props) => {
  const navigate = useNavigate()

  const handleNavigate = (route: string) => {
    navigate(`${route}?token=${token.id}&chainId=${token.chain}`)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Card sx={{ backgroundColor: 'contentBackground' }} p={4} {...props}>
      <Box variant="layout.verticalAlign" sx={{ position: 'relative' }}>
        <ChainBadge chain={token.chain} />

        <Box
          pr={4}
          mr={4}
          sx={{
            flexShrink: 0,
            display: ['none', 'block'],
            borderRight: '1px solid',
            borderColor: 'darkBorder',
          }}
        >
          <Skeleton height={193} width={175} />
        </Box>
        <Box>
          <Box variant="layout.verticalAlign" mb={3}>
            <TokenLogo width="42px" src={token.logo} />
            <Box ml="3">
              <Text variant="sectionTitle">{token.symbol}</Text>
              <Text variant="legend" sx={{ fontSize: 1 }}>
                ${formatCurrency(token.price, 5)}
              </Text>
            </Box>
          </Box>
          <Box mb={1} pl={2} variant="layout.verticalAlign">
            <CollaterizationIcon />
            <Text ml="2" variant="legend">
              <Trans>Backing + Overcollaterization:</Trans>
            </Text>
            <Text ml="2" variant="strong">
              {(token.backing + token.overcollaterization).toFixed(0)}%
            </Text>
          </Box>
          <Box pl="2" variant="layout.verticalAlign">
            <Text variant="strong" pl="1" sx={{ width: '16px' }}>
              $
            </Text>
            <Text ml="2" variant="legend">
              <Trans>Market cap:</Trans>
            </Text>
            <Text ml="2" variant="strong">
              ${formatCurrency(token.supply, 0)}
            </Text>
          </Box>
          <Box variant="layout.verticalAlign" sx={{ flexWrap: 'wrap' }}>
            <Button
              onClick={() => handleNavigate(ROUTES.STAKING)}
              mt={3}
              mr={3}
              medium
            >
              Stake RSR - {token.stakingApy.toFixed(1)}% Est. APY
            </Button>
            <Button
              onClick={() => handleNavigate(ROUTES.ISSUANCE)}
              mt={3}
              mr={3}
              medium
              variant="muted"
            >
              Mint - {token.tokenApy.toFixed(1)}% Est. APY
            </Button>
            <Button mt={3} mr={3} medium variant="transparent">
              <Box variant="layout.verticalAlign">
                <Text mr={3}>Explore</Text> <ArrowRight size={16} />
              </Box>
            </Button>
            <Button mt={3} medium variant="transparent">
              <Box variant="layout.verticalAlign">
                <Text mr={3}>Earn</Text> <ArrowRight size={16} />
              </Box>
            </Button>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default memo(RTokenCard)
