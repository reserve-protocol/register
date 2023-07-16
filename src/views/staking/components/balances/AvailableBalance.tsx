import { t, Trans } from '@lingui/macro'
import StRSR from 'abis/StRSR'
import TransactionButton from 'components/button/TransactionButton'
import Help from 'components/help'
import TokenBalance from 'components/token-balance'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import {
  rTokenStateAtom,
  rTokenTradingAvailableAtom,
  walletAtom,
} from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { pendingRSRSummaryAtom } from 'views/staking/atoms'

const AvailableBalance = () => {
  const rToken = useRToken()
  const { exchangeRate: rate } = useAtomValue(rTokenStateAtom)
  const { index, availableAmount } = useAtomValue(pendingRSRSummaryAtom)
  const account = useAtomValue(walletAtom)
  const { isCollaterized } = useAtomValue(rTokenStateAtom)
  const isRTokenAvailable = useAtomValue(rTokenTradingAvailableAtom)

  const { write, isReady, isLoading, hash } = useContractWrite(
    rToken?.stToken &&
      isCollaterized &&
      isRTokenAvailable &&
      availableAmount &&
      account
      ? {
          address: rToken.stToken.address,
          abi: StRSR,
          functionName: 'withdraw',
          args: [account, index + 1n],
        }
      : undefined
  )
  const { isMining } = useWatchTransaction({ hash, label: 'Withdraw RSR' })

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>Available</Trans>
      </Text>
      <TokenBalance symbol="RSR" balance={availableAmount * rate} />
      <TransactionButton
        small
        mt={3}
        text={t`Withdraw`}
        mining={isMining}
        loading={isLoading || isMining}
        onClick={write}
        disabled={!isReady}
      />
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
