import { Trans } from '@lingui/macro'
import TokenBalance from 'components/token-balance'
import { atom, useAtomValue } from 'jotai'
import { rsrExchangeRateAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { pendingRSRSummaryAtom } from 'views/staking/atoms'

const pendingRSRBalanceAtom = atom(
  (get) => get(pendingRSRSummaryAtom).pendingAmount
)

const PendingBalance = () => {
  const balance = useAtomValue(pendingRSRBalanceAtom)
  const rate = useAtomValue(rsrExchangeRateAtom)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>In Cooldown</Trans>
      </Text>
      <TokenBalance symbol={'RSR'} balance={balance * rate} />
    </Box>
  )
}

export default PendingBalance
