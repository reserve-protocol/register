import { t, Trans } from '@lingui/macro'
import { ExecuteButton } from 'components/button'
import Help from 'components/help'
import TokenBalance from 'components/token-balance'
import { BigNumber } from 'ethers'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  rsrExchangeRateAtom,
  rTokenStateAtom,
  rTokenTradingAvailableAtom,
  walletAtom,
} from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { TRANSACTION_STATUS } from 'utils/constants'
import { pendingRSRSummaryAtom } from 'views/staking/atoms'

const AvailableBalance = () => {
  const rToken = useRToken()
  const rate = useAtomValue(rsrExchangeRateAtom)
  const { index, availableAmount } = useAtomValue(pendingRSRSummaryAtom)
  const account = useAtomValue(walletAtom)
  const { isCollaterized } = useAtomValue(rTokenStateAtom)
  const isRTokenAvailable = useAtomValue(rTokenTradingAvailableAtom)
  const tx = useMemo(() => {
    if (
      !rToken?.stToken?.address ||
      !isCollaterized ||
      !isRTokenAvailable ||
      !availableAmount
    ) {
      return null
    }

    return {
      id: '',
      description: t`Withdraw RSR`,
      status: TRANSACTION_STATUS.PENDING,
      value: availableAmount.toString(),
      call: {
        abi: 'stRSR',
        address: rToken?.stToken?.address,
        method: 'withdraw',
        args: [account, index.add(BigNumber.from(1))],
      },
    }
  }, [rToken?.address, availableAmount, account])

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>Available</Trans>
      </Text>
      <TokenBalance symbol="RSR" balance={availableAmount * rate} />
      <ExecuteButton small mt={3} text={t`Withdraw`} tx={tx} />
      {!isCollaterized ||
        (!isRTokenAvailable && (
          <Box
            mt={3}
            variant="layout.verticalAlign"
            sx={{ color: 'warning', fontSize: '1' }}
          >
            <Text mr={2}>Withdrawals unavailable</Text>
            <Help
              content={
                !isCollaterized
                  ? t`This RToken is currently on recollaterization, when this process is finish withdrawals will be available again.`
                  : t`RToken paused or frozen`
              }
            />
          </Box>
        ))}
    </Box>
  )
}

export default AvailableBalance
