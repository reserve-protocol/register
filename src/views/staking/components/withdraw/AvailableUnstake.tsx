import { Trans, t } from '@lingui/macro'
import StRSR from 'abis/StRSR'
import TransactionButton from 'components/button/TransactionButton'
import TokenLogo from 'components/icons/TokenLogo'
import useContractWrite from 'hooks/useContractWrite'
import useRToken from 'hooks/useRToken'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { Check } from 'react-feather'
import {
  rTokenStateAtom,
  rTokenTradingAvailableAtom,
  rsrPriceAtom,
  walletAtom,
} from 'state/atoms'
import { boxShadow } from 'theme'
import { Box, BoxProps, Card, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { pendingRSRSummaryAtom } from 'views/staking/atoms'

const Header = () => (
  <Box
    variant="layout.verticalAlign"
    sx={{ borderBottom: '1px solid', borderColor: 'borderSecondary' }}
    pb={3}
  >
    <Check size={20} strokeWidth={1.2} />
    <Text ml="2" variant="bold">
      <Trans>RSR available to withdraw</Trans>
    </Text>
  </Box>
)

const AvailableBalance = () => {
  const { availableAmount } = useAtomValue(pendingRSRSummaryAtom)
  const price = useAtomValue(rsrPriceAtom)

  return (
    <Box variant="layout.verticalAlign" mt={3} mr="auto">
      <TokenLogo symbol="rsr" />
      <Box ml={3}>
        <Text variant="bold">{formatCurrency(availableAmount)} RSR</Text>
        <Text variant="legend" sx={{ fontSize: 1, display: 'block' }}>
          ${formatCurrency(availableAmount * price)}
        </Text>
      </Box>
    </Box>
  )
}

const ConfirmWithdraw = () => {
  const rToken = useRToken()
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
    <TransactionButton
      small
      mt={3}
      text={t`Withdraw`}
      mining={isMining}
      loading={isLoading || isMining}
      onClick={write}
      disabled={!isReady}
    />
  )
}

const AvailableUnstake = (props: BoxProps) => {
  return (
    <Card
      {...props}
      sx={{ backgroundColor: 'focusedBackground', boxShadow: boxShadow }}
      p={4}
    >
      <Header />
      <Box variant="layout.verticalAlign">
        <AvailableBalance />
        <ConfirmWithdraw />
      </Box>
    </Card>
  )
}

export default AvailableUnstake
