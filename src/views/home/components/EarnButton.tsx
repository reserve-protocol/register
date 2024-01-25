import { Button } from 'components'
import ChevronRight from 'components/icons/ChevronRight'
import EarnIcon from 'components/icons/EarnIcon'
import { ListedToken } from 'hooks/useTokenList'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { rTokenPoolsAtom } from 'state/pools/atoms'
import { mediumButton } from 'theme'
import { Box, BoxProps, Text } from 'theme-ui'
import { BRIDGED_RTOKENS, ROUTES } from 'utils/constants'
import { getAddress } from 'viem'
import VerticalDivider from './VerticalDivider'

interface Props extends BoxProps {
  token: ListedToken
}

const EarnButton = ({ token, sx, ...props }: Props) => {
  const navigate = useNavigate()
  const pools = useAtomValue(rTokenPoolsAtom)
  const earnData = pools[getAddress(token.id)]

  const handleEarn = () => {
    const addresses = [token.id]

    if (BRIDGED_RTOKENS[token.chain]?.[token.id]) {
      for (const bridgeToken of BRIDGED_RTOKENS[token.chain]?.[token.id]) {
        addresses.push(bridgeToken.address)
      }
    }

    navigate(
      `${ROUTES.EARN}?underlying=${addresses.join(',')}&chainId=${token.chain}`
    )
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  if (!earnData) return null

  return (
    <Box variant="layout.verticalAlign" sx={{ gap: 1, ...sx }} {...props}>
      <VerticalDivider sx={{ display: ['block', 'none'] }} />
      <Button
        onClick={(e) => {
          e.stopPropagation()
          handleEarn()
        }}
        variant="hover"
        sx={{
          width: ['100%', 'fit-content'],
          ...mediumButton,
          pr: [0, 3],
        }}
      >
        <Box
          variant="layout.verticalAlign"
          sx={{ gap: [1, 2], justifyContent: ['space-between', 'start'] }}
        >
          <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
            <EarnIcon />
            <Text>Earn: </Text>
            <Text
              ml="1"
              variant="strong"
              sx={{ color: 'rBlue', fontWeight: 700 }}
            >
              {earnData.maxApy.toFixed(0)}% APY
            </Text>
          </Box>
          <Box sx={{ display: ['none', 'block'] }}>
            <ChevronRight color="#2150A9" />
          </Box>
          <Box sx={{ display: ['block', 'none'] }}>
            <ChevronRight color="#2150A9" width={16} height={16} />
          </Box>
        </Box>
      </Button>
    </Box>
  )
}
export default memo(EarnButton)
