import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useEffect } from 'react'
import {
  bridgeAmountAtom,
  bridgeTxAtom,
  btnLabelAtom,
  isBridgeWrappingAtom,
  selectedBridgeToken,
} from '../atoms'
import { UseSimulateContractParameters } from 'wagmi'

const ConfirmBridgeBtn = ({ onSuccess }: { onSuccess(): void }) => {
  const bridgeTransaction = useAtomValue(bridgeTxAtom)
  const bridgeToken = useAtomValue(selectedBridgeToken)
  const isWrapping = useAtomValue(isBridgeWrappingAtom)
  const [amount, setAmount] = useAtom(bridgeAmountAtom)
  const {
    isReady,
    gas,
    hash,
    validationError,
    status,
    error,
    reset,
    isLoading,
    write,
  } = useContractWrite(bridgeTransaction as UseSimulateContractParameters)
  useWatchTransaction({ hash, label: 'Bridge to base' })

  const confirmLabel = useAtomValue(btnLabelAtom)

  useEffect(() => {
    if (status === 'success') {
      mixpanel.track('Bridge Success', {
        Token: isWrapping ? bridgeToken.L1symbol : bridgeToken.L2symbol,
        Amount: amount,
        Destination: isWrapping ? 'Base' : 'Ethereum',
      })
      setAmount('')
      reset()
      onSuccess()
    }
  }, [status])

  return (
    <TransactionButton
      disabled={!isReady}
      gas={gas}
      loading={isLoading || !!hash}
      loadingText={!!hash ? 'Confirming tx...' : 'Pending, sign in wallet'}
      onClick={write}
      text={confirmLabel}
      fullWidth
      error={validationError || error}
    />
  )
}

export default ConfirmBridgeBtn
