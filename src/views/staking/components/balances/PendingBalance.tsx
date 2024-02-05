import { Trans, t } from '@lingui/macro'
import StRSR from 'abis/StRSR'
import TransactionButton from 'components/button/TransactionButton'
import TokenBalance from 'components/token-balance'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { isModuleLegacyAtom, rTokenStateAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { pendingRSRSummaryAtom } from 'views/staking/atoms'

const PendingBalance = () => {
  const rToken = useRToken()
  const { index, pendingAmount: balance } = useAtomValue(pendingRSRSummaryAtom)
  const { frozen } = useAtomValue(rTokenStateAtom)
  const { staking: isLegacy } = useAtomValue(isModuleLegacyAtom)
  const { exchangeRate: rate } = useAtomValue(rTokenStateAtom)

  const { isLoading, write, isReady, hash } = useContractWrite(
    rToken?.stToken && balance && !frozen
      ? {
          address: rToken?.stToken?.address,
          abi: StRSR,
          functionName: 'cancelUnstake',
          args: [index + 1n],
        }
      : undefined
  )
  const { isMining } = useWatchTransaction({ hash, label: 'Cancel unstake' })

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>In Cooldown</Trans>
      </Text>
      <TokenBalance symbol={'RSR'} balance={balance} />
      {!isLegacy && (
        <TransactionButton
          small
          mt={3}
          text={t`Cancel unstake`}
          mining={isMining}
          loading={isLoading || isMining}
          onClick={write}
          disabled={!isReady}
        />
      )}
    </Box>
  )
}

export default PendingBalance
