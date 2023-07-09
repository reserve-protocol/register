import { Trans } from '@lingui/macro'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { GasEstimation } from 'hooks/useGasEstimate'
import { useAtomValue } from 'jotai'
import { walletAtom } from 'state/atoms'
import { Box, Spinner, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { useBalance } from 'wagmi'
import Button, { ButtonProps, LoadingButton, LoadingButtonProps } from '.'

interface TransactionButtonProps extends LoadingButtonProps {
  gas?: GasEstimation
}

interface GasEstimateLabelProps {
  gas: GasEstimation
}

const GasEstimateLabel = ({ gas, ...props }: GasEstimateLabelProps) => (
  <Box mt={3} sx={{ fontSize: 1, textAlign: 'center' }}>
    <Text variant="legend" mr={1}>
      <Trans>Estimated gas cost:</Trans>
      {!gas.isLoading && !gas.estimateUsd && ' --'}
    </Text>
    {gas.isLoading && <Spinner color="black" size={12} />}
    {!!gas.estimateUsd && (
      <Text sx={{ fontWeight: 500 }}>${formatCurrency(gas.estimateUsd)}</Text>
    )}
  </Box>
)

const ConnectWallet = (props: ButtonProps) => {
  const { openConnectModal } = useConnectModal()

  return (
    <Button {...props} onClick={openConnectModal}>
      <Text>
        <Trans>Connect Wallet</Trans>
      </Text>
    </Button>
  )
}

const TransactionButton = ({ gas, ...props }: TransactionButtonProps) => {
  const address = useAtomValue(walletAtom)
  const { data } = useBalance({
    address: address ?? undefined,
  })

  if (gas?.estimateEth && data?.value && gas.estimateEth > data.value) {
    return (
      <Button {...props} disabled>
        <Trans>Not enough</Trans> {data.symbol}
      </Button>
    )
  }

  if (!address) {
    return <ConnectWallet {...props} disabled={false} />
  }

  return (
    <>
      <LoadingButton {...props} />
      {!!gas && <GasEstimateLabel gas={gas} />}
    </>
  )
}

export default TransactionButton
