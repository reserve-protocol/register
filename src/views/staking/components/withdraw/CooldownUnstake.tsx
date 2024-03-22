import { t } from '@lingui/macro'
import StRSR from 'abis/StRSR'
import TransactionButton from 'components/button/TransactionButton'
import SpinnerIcon from 'components/icons/SpinnerIcon'
import TokenLogo from 'components/icons/TokenLogo'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { rTokenStateAtom, rsrPriceAtom } from 'state/atoms'
import { Box, BoxProps, Card, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { pendingRSRSummaryAtom, unstakeDelayAtom } from 'views/staking/atoms'

const Header = () => {
  const delay = useAtomValue(unstakeDelayAtom)

  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ borderBottom: '1px solid', borderColor: 'borderSecondary' }}
      pb={3}
    >
      <SpinnerIcon />
      <Text ml="2" variant="bold">
        RSR in {delay} Cooldown
      </Text>
    </Box>
  )
}

const AvailableBalance = () => {
  const { pendingAmount } = useAtomValue(pendingRSRSummaryAtom)
  const price = useAtomValue(rsrPriceAtom)

  return (
    <Box variant="layout.verticalAlign" mt={3} mr="auto">
      <TokenLogo symbol="rsr" />
      <Box ml={3}>
        <Text variant="bold">{formatCurrency(pendingAmount)} RSR</Text>
        <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
          ${formatCurrency(pendingAmount * price)}
        </Text>
      </Box>
    </Box>
  )
}

const ConfirmWithdraw = () => {
  const rToken = useRToken()
  const { index, pendingAmount } = useAtomValue(pendingRSRSummaryAtom)
  const { frozen } = useAtomValue(rTokenStateAtom)
  const { isLoading, write, isReady, hash } = useContractWrite(
    rToken?.stToken && pendingAmount && !frozen
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
    <TransactionButton
      small
      mt={3}
      text={t`Cancel unstake`}
      mining={isMining}
      loading={isLoading || isMining}
      onClick={write}
      disabled={!isReady}
    />
  )
}

const CooldownUnstake = (props: BoxProps) => {
  const { pendingAmount } = useAtomValue(pendingRSRSummaryAtom)

  return (
    <Box variant="layout.borderBox" {...props}>
      <Header />
      {!pendingAmount ? (
        <Text mt={3} sx={{ display: 'block' }} variant="legend">
          No RSR in cooldown
        </Text>
      ) : (
        <Box variant="layout.verticalAlign">
          <AvailableBalance />
          <ConfirmWithdraw />
        </Box>
      )}
    </Box>
  )
}

export default CooldownUnstake
