import { Trans } from '@lingui/macro'
import { Button } from 'components'
import StakedIcon from 'components/icons/StakedIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { MoreHorizontal } from 'react-feather'
import { estimatedApyAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'

const Mandate = () => {}

const TokenAddresses = () => {}

const Actions = () => {
  return (
    <Box variant="layout.verticalAlign" mt={4}>
      <Button mr={3} variant="accent">
        Mint
      </Button>
      <Button mr={3}>Stake RSR - 15% Est. APY</Button>
      <Button variant="bordered">
        <Box sx={{ height: 22 }}>
          <MoreHorizontal />
        </Box>
      </Button>
    </Box>
  )
}

const Hero = () => {
  const rToken = useRToken()
  // TODO: replace stats for a single hook that pool everything from theGraph
  const { holders, stakers } = useAtomValue(estimatedApyAtom)

  return (
    <Box>
      <TokenLogo mb={3} symbol={rToken?.symbol} width={40} />
      <Text>
        <Trans>Total Market Cap</Trans>
      </Text>
      <Text variant="accent" as="h1" sx={{ fontSize: 6 }}>
        $28,823,662
      </Text>
      <Box variant="layout.verticalAlign">
        <StakedIcon />
        <Text ml={2}>
          <Trans>Stake pool USD value:</Trans>
        </Text>
        <Text ml="1" variant="strong">
          $8,340,030
        </Text>
      </Box>
      <Actions />
    </Box>
  )
}

export default Hero
