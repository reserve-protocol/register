import { t, Trans } from '@lingui/macro'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import TransactionError from 'components/transaction-error/TransactionError'
import useContractWrite from 'hooks/useContractWrite'
import { useGasAmount } from 'hooks/useGasEstimate'
import useNotification from 'hooks/useNotification'
import useSwitchChain from 'hooks/useSwitchChain'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { chainIdAtom, walletAtom, walletChainAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { CHAIN_TAGS } from 'utils/constants'
import { UseSimulateContractParameters } from 'wagmi'
import Button, { ButtonProps, LoadingButton, LoadingButtonProps } from '.'

interface TransactionButtonProps extends LoadingButtonProps {
  gas?: bigint
  mining?: boolean
  error?: Error | null
  chain?: number
}

export const GasEstimateLabel = ({ gas, ...props }: { gas: bigint }) => {
  const { usd } = useGasAmount(gas)

  return (
    <Box mt={3} sx={{ fontSize: 1, textAlign: 'center' }}>
      <Text variant="legend" mr={1}>
        <Trans>Estimated gas cost:</Trans>
      </Text>
      <Text sx={{ fontWeight: 500 }}>${formatCurrency(usd)}</Text>
    </Box>
  )
}

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

interface ITransactionButtonContainer extends BoxProps {
  chain?: number
}

export const TransactionButtonContainer = ({
  children,
  chain,
  ...props
}: ITransactionButtonContainer) => {
  const wallet = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isInvalidWallet = walletChain !== (chain || chainId)
  const switchChain = useSwitchChain()
  let Component = children

  if (!wallet) {
    Component = <ConnectWalletButton fullWidth />
  } else if (isInvalidWallet && switchChain) {
    Component = (
      <Button
        variant="accentAction"
        fullWidth
        onClick={() => {
          switchChain(chain || chainId)
        }}
      >
        <Text>Switch to {CHAIN_TAGS[chain || chainId]}</Text>
      </Button>
    )
  }

  return <Box {...props}>{Component}</Box>
}

const TransactionButton = ({
  gas,
  mining,
  error,
  loading,
  chain,
  loadingText,
  ...props
}: TransactionButtonProps) => {
  const address = useAtomValue(walletAtom)
  const walletChain = useAtomValue(walletChainAtom)
  const chainId = useAtomValue(chainIdAtom)
  const switchChain = useSwitchChain()
  const isInvalidWallet = chain
    ? chain !== chainId || walletChain !== chain
    : walletChain !== chainId

  if (!address) {
    return <ConnectWalletButton {...props} disabled={false} />
  }

  if (isInvalidWallet && switchChain) {
    return (
      <Button
        {...props}
        disabled={false}
        onClick={() => {
          if (chain && chain !== chainId) {
            switchChain(chain)
          }

          switchChain(chain || chainId)
        }}
      >
        <Text>Switch to {CHAIN_TAGS[chain || chainId]}</Text>
      </Button>
    )
  }

  if (mining) {
    loadingText = t`Tx in process...`
  }

  return (
    <>
      <LoadingButton loading={loading} loadingText={loadingText} {...props} />
      {!!gas && <GasEstimateLabel gas={gas} />}
      {!!error && (
        <TransactionError sx={{ textAlign: 'center' }} mt={3} error={error} />
      )}
    </>
  )
}

// Execute tx and forget type of button
interface ExecuteButtonProps extends LoadingButtonProps {
  call: UseSimulateContractParameters | undefined
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
