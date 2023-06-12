import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { LoadingButton } from 'components/button'
import Help from 'components/help'
import TokenBalance from 'components/token-balance'
import { BigNumber } from 'ethers/lib/ethers'
import useRToken from 'hooks/useRToken'
import useTransaction from 'hooks/useTransaction'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rsrExchangeRateAtom, rTokenCollaterizedAtom } from 'state/atoms'
import { smallButton } from 'theme'
import { Box, Text } from 'theme-ui'
import { TRANSACTION_STATUS } from 'utils/constants'
import { pendingRSRSummaryAtom } from 'views/staking/atoms'

const AvailableBalance = () => {
  const rToken = useRToken()
  const rate = useAtomValue(rsrExchangeRateAtom)
  const { index, availableAmount } = useAtomValue(pendingRSRSummaryAtom)
  const { account } = useWeb3React()
  const canWithdraw = useAtomValue(rTokenCollaterizedAtom)
  const tx = useMemo(() => {
    if (!rToken?.stToken?.address || !canWithdraw || !availableAmount) {
      return null
    }

    return {
      id: '',
      description: t`Withdraw RSR`,
      status: TRANSACTION_STATUS.PENDING,
      value: availableAmount,
      call: {
        abi: 'stRSR',
        address: rToken?.stToken?.address,
        method: 'withdraw',
        args: [account, index.add(BigNumber.from(1))],
      },
    }
  }, [rToken?.address, availableAmount, account])

  const { execute, canExecute, isExecuting } = useTransaction(tx)

  return (
    <Box p={4}>
      <Text variant="subtitle" mb={3}>
        <Trans>Available</Trans>
      </Text>
      <TokenBalance symbol="RSR" balance={availableAmount * rate} />
      <LoadingButton
        loading={isExecuting}
        disabled={!canExecute}
        text={t`Withdraw`}
        onClick={execute}
        sx={{ ...smallButton }}
        mt={3}
      />
      {!canWithdraw && (
        <Box
          mt={3}
          variant="layout.verticalAlign"
          sx={{ color: 'warning', fontSize: '1' }}
        >
          <Text mr={2}>Withdrawals unavailable</Text>
          <Help
            content={t`This RToken is currently on recollaterization, when this process is finish withdrawals will be available again.`}
          />
        </Box>
      )}
    </Box>
  )
}

export default AvailableBalance
