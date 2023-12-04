import { Trans, t } from '@lingui/macro'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import TransactionError from 'components/transaction-error/TransactionError'
import useContractWrite from 'hooks/useContractWrite'
import { GasEstimation } from 'hooks/useGasEstimate'
import useNotification from 'hooks/useNotification'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { CheckCircle } from 'react-feather'
import { chainIdAtom, isWalletInvalidAtom, walletAtom } from 'state/atoms'
import { Box, Spinner, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import {
  UsePrepareContractWriteConfig,
  useBalance,
  useSwitchNetwork,
} from 'wagmi'
import Button, { ButtonProps, LoadingButton, LoadingButtonProps } from '.'
import { CHAIN_TAGS } from 'utils/constants'

interface TransactionButtonProps extends LoadingButtonProps {
  gas?: GasEstimation
  mining?: boolean
  error?: Error | null
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
    {gas.isLoading && <Spinner color="--theme-ui-colors-text" size={12} />}
    {!!gas.estimateUsd && (
      <Text sx={{ fontWeight: 500 }}>${formatCurrency(gas.estimateUsd)}</Text>
    )}
  </Box>
)

export const ConnectWalletButton = (props: ButtonProps) => {
  const { openConnectModal } = useConnectModal()

  return (
    <Button {...props} onClick={openConnectModal} variant="accentAction">
      <Text>
        <Trans>Connect Wallet</Trans>
      </Text>
    </Button>
  )
}

const TransactionButton = ({
  gas,
  mining,
  error,
  loading,
  loadingText,
  ...props
}: TransactionButtonProps) => {
  const address = useAtomValue(walletAtom)
  const isInvalidWallet = useAtomValue(isWalletInvalidAtom)
  const { switchNetwork } = useSwitchNetwork()
  const chainId = useAtomValue(chainIdAtom)

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
    return <ConnectWalletButton {...props} disabled={false} />
  }

  if (isInvalidWallet && switchNetwork) {
    return (
      <Button sx={{ width: '100%' }} onClick={() => switchNetwork(chainId)}>
        <Text>Switch chain to {CHAIN_TAGS[chainId]}</Text>
      </Button>
    )
  }

  if (mining) {
    loadingText = t`Tx in process...`
  }

  return (
    <>
      <LoadingButton loading={loading} {...props} />
      {!!gas && <GasEstimateLabel gas={gas} />}
      {!!error && (
        <TransactionError sx={{ textAlign: 'center' }} mt={3} error={error} />
      )}
    </>
  )
}

// Execute tx and forget type of button
interface ExecuteButtonProps extends LoadingButtonProps {
  call: UsePrepareContractWriteConfig | undefined
  txLabel?: string
  successLabel?: string
  onSuccess?(): void
}

export const ExecuteButton = ({
  call,
  onSuccess,
  txLabel,
  successLabel,
  disabled,
  loadingText,
  ...props
}: ExecuteButtonProps) => {
  const { write, hash, isLoading, validationError, reset, isReady } =
    useContractWrite(call)
  const notify = useNotification()
  const { isMining, status } = useWatchTransaction({
    hash,
    label: txLabel || props.text,
  })

  if (isMining) {
    loadingText = t`Tx in process...`
  }

  useEffect(() => {
    if (status === 'success') {
      if (onSuccess) {
        onSuccess()
      }

      setTimeout(reset, 3000)
    }
  }, [status])

  useEffect(() => {
    if (validationError) {
      notify('Transaction not valid', validationError.message, 'error')
    }
  }, [validationError])

  if (status === 'success') {
    if (!successLabel) {
      return <CheckCircle color="#75FBC3" size={18} />
    }
    props.text = successLabel
  }

  return (
    <LoadingButton
      loading={isLoading || isMining}
      disabled={status === 'success' || disabled || !isReady}
      onClick={write}
      {...props}
    />
  )
}

export default TransactionButton
