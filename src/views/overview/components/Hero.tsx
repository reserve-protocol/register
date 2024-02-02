import { Trans } from '@lingui/macro'
import { Button } from 'components'
import MandateIcon from 'components/icons/MandateIcon'
import StakedIcon from 'components/icons/StakedIcon'
import { CurrentRTokenLogo } from 'components/icons/TokenLogo'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { MoreHorizontal } from 'react-feather'
import Skeleton from 'react-loading-skeleton'
import {
  rTokenListAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
  rsrPriceAtom,
} from 'state/atoms'
import { Box, Grid, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

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

// TODO: Move this to a more re-usable place?
const rTokenOverviewAtom = atom((get) => {
  const state = get(rTokenStateAtom)
  const rTokenPrice = get(rTokenPriceAtom)
  const rsrPrice = get(rsrPriceAtom)

  if (!rTokenPrice || !rsrPrice) {
    return null
  }

  return {
    supply: state.tokenSupply * rTokenPrice,
    staked: state.stTokenSupply * rsrPrice,
  }
})

const TokenMetrics = () => {
  const data = useAtomValue(rTokenOverviewAtom)

  return (
    <>
      <Text sx={{ display: 'block' }}>
        <Trans>Total Market Cap</Trans>
      </Text>

      <Text variant="accent" as="h1" sx={{ fontSize: 6 }}>
        ${formatCurrency(data?.supply ?? 0)}
      </Text>
      <Box variant="layout.verticalAlign">
        <StakedIcon />
        <Text ml={2}>
          <Trans>Stake pool USD value:</Trans>
        </Text>
        <Text ml="1" variant="strong">
          ${formatCurrency(data?.staked ?? 0)}
        </Text>
      </Box>
    </>
  )
}

const TokenStats = () => {
  return (
    <Box>
      <CurrentRTokenLogo mb={3} width={40} />
      <TokenMetrics />
      <Actions />
    </Box>
  )
}

const TokenMandate = () => {
  const rToken = useRToken()
  const rTokenList = useAtomValue(rTokenListAtom)

  return (
    <Box
      sx={{
        maxWidth: 500,
        borderLeft: '1px solid',
        borderColor: ['transparent', 'transparent', 'border'],
        paddingLeft: [0, 0, 7],
      }}
    >
      <MandateIcon />
      <Text sx={{ fontSize: 3 }} variant="strong" mb={2} mt={3}>
        <Trans>Mandate</Trans>
      </Text>
      <Text as="p" variant="legend">
        {rToken?.mandate ? rToken.mandate : <Skeleton count={6} />}
      </Text>
      {/* {rToken?.listed && (
        <Box mt={4}>
          <Text mb={2} variant="strong">
            <Trans>+ Off-chain note</Trans>
          </Text>
          <Text as="p" variant="legend">
            {rTokenList[rToken.address]?.about}
          </Text>
        </Box>
      )} */}
    </Box>
  )
}

const Hero = () => {
  return (
    <Grid gap={6} columns={[1, 1, 2]}>
      <TokenStats />
      <TokenMandate />
    </Grid>
  )
}

export default Hero
