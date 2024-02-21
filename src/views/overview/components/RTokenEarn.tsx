import { Trans } from '@lingui/macro'
import EarnIcon from 'components/icons/EarnIcon'
import useRToken from 'hooks/useRToken'
import { atom, useAtomValue } from 'jotai'
import { selectedRTokenAtom } from 'state/atoms'
import { poolsAtom } from 'state/pools/atoms'
import { Box, Text } from 'theme-ui'
import PoolsTable from 'views/earn/components/PoolsTable'

const rTokenPoolsAtom = atom((get) => {
  const pools = get(poolsAtom)
  const rToken = get(selectedRTokenAtom)

  if (!rToken) {
    return []
  }

  return pools.filter((pool) => {
    if (
      !pool.underlyingTokens.find(
        (token) => token.address.toLowerCase() === rToken.toLowerCase()
      )
    ) {
      return false
    }

    return true
  })
})

const RTokenEarn = () => {
  const data = useAtomValue(rTokenPoolsAtom)
  const rToken = useRToken()

  return (
    <Box>
      <Box
        variant="layout.verticalAlign"
        ml="4"
        mb={3}
        mt={6}
        sx={{ color: 'accent' }}
      >
        <EarnIcon fontSize={24} />
        <Text ml="3" as="h2" variant="heading">
          <Trans>Earn</Trans>
        </Text>
      </Box>
      <Text ml="4" sx={{ fontSize: 3, maxWidth: 720 }}>
        <Trans>Explore yield opportunities for {rToken?.symbol ?? ''}</Trans>
      </Text>
      <PoolsTable mt={6} compact data={data} />
    </Box>
  )
}

export default RTokenEarn
