import { Trans, t } from '@lingui/macro'
import { ExecuteButton } from 'components/button'
import TokenBalance from 'components/token-balance'
import { BigNumber } from 'ethers'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  getValidWeb3Atom,
  isModuleLegacyAtom,
  rTokenStatusAtom,
  rsrExchangeRateAtom,
} from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { TRANSACTION_STATUS } from 'utils/constants'
import { pendingRSRSummaryAtom } from 'views/staking/atoms'

const PendingBalance = () => {
  const rToken = useRToken()
  const { index, pendingAmount: balance } = useAtomValue(pendingRSRSummaryAtom)
  const { frozen } = useAtomValue(rTokenStatusAtom)
  const { staking: isLegacy } = useAtomValue(isModuleLegacyAtom)
  const rate = useAtomValue(rsrExchangeRateAtom)

  const tx = useMemo(() => {
    if (!rToken?.stToken?.address || !balance || frozen) {
      return null
    }

    return {
      id: '',
      description: t`Cancel unstake`,
      status: TRANSACTION_STATUS.PENDING,
      value: balance.toString(),
      call: {
        abi: 'stRSR',
        address: rToken?.stToken?.address,
        method: 'cancelUnstake',
        args: [index.add(BigNumber.from(1))],
      },
    }
  }, [rToken?.address, balance, index])

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>In Cooldown</Trans>
      </Text>
      <TokenBalance symbol={'RSR'} balance={balance * rate} />
      {!isLegacy && (
        <ExecuteButton small mt={3} text={t`Cancel unstake`} tx={tx} />
      )}
    </Box>
  )
}

export default PendingBalance
