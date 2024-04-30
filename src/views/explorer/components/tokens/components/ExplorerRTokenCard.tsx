import ChainLogo from 'components/icons/ChainLogo'
import TokenLogo from 'components/icons/TokenLogo'
import useTokenList, { ListedToken } from 'hooks/useTokenList'
import { ChevronRight } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import { Box, BoxProps, Card, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { CHAIN_TAGS } from 'utils/constants'
import RTokenAddresses from 'views/overview/components/RTokenAddresses'

interface IExplorerRTokenCard extends BoxProps {
  token: ListedToken
}

const ChainBadge = ({ chain }: { chain: number }) => (
  <Box
    variant="layout.verticalAlign"
    sx={{
      display: ['none', 'flex'],
      backgroundColor: 'rgba(0, 82, 255, 0.06)',
      border: '1px solid',
      borderColor: 'rgba(0, 82, 255, 0.20)',
      borderRadius: '50px',
      padding: '4px 8px',
      gap: 1,
    }}
  >
    <ChainLogo chain={chain} fontSize={12} />
    <Text sx={{ fontSize: 12 }} color="#627EEA">
      {CHAIN_TAGS[chain] + ' Native'}
    </Text>
  </Box>
)

const ExplorerRTokenCard = ({ token }: IExplorerRTokenCard) => {
  return (
    <Card mb={3}>
      <Box variant="layout.verticalAlign">
        <Box
          variant="layout.centered"
          sx={{ alignItems: 'start', gap: [2, 4], width: '100%' }}
        >
          <Box
            variant="layout.verticalAlign"
            sx={{
              gap: '12px',
              justifyContent: ['space-between', 'start'],
              flexGrow: 1,
              width: '100%',
            }}
          >
            <TokenLogo
              width={50}
              src={token.logo}
              sx={{ display: ['none', 'block'] }}
            />
            <Box variant="layout.centered" sx={{ alignItems: 'start' }}>
              <Text sx={{ fontSize: 26, fontWeight: 700, lineHeight: '26px' }}>
                {token.symbol}
              </Text>
              <Text variant="legend" sx={{ fontSize: 16 }}>
                ${formatCurrency(token.price, 2)}
              </Text>
            </Box>
            <Box sx={{ display: ['block', 'none'] }}>
              <ChevronRight width={16} height={16} />
            </Box>
          </Box>
        </Box>
        <Flex
          ml="auto"
          sx={{
            gap: 2,
            flexShrink: 0,
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <Box
            variant="layout.verticalAlign"
            sx={{ gap: 2, justifyContent: 'right' }}
          >
            <TokenLogo
              width={32}
              src={token.logo}
              sx={{ display: ['block', 'none'], height: '32px' }}
            />
            <ChainBadge chain={token.chain} />
            <Box sx={{ display: ['block', 'none'] }}>
              <ChainLogo chain={token.chain} fontSize={12} />
            </Box>
          </Box>
          <RTokenAddresses token={token} />
        </Flex>
      </Box>
      hola
    </Card>
  )
}

export default ExplorerRTokenCard
