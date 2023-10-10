import ERC20 from 'abis/ERC20'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useHasAllowance from 'hooks/useHasAllowance'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { safeParseEther } from 'utils'
import { Address } from 'viem'
import {
  bridgeAmountAtom,
  bridgeAmountDebouncedAtom,
  bridgeTxAtom,
  isBridgeWrappingAtom,
  selectedTokenAtom,
} from '../atoms'

const btnLabelAtom = atom((get) => {
  const token = get(selectedTokenAtom)
  const isWrapping = get(isBridgeWrappingAtom)

  return `${isWrapping ? 'Deposit' : 'Withdraw'} ${token.symbol} to ${
    isWrapping ? 'Base' : 'Ethereum'
  }`
})

const approvalAtom = atom((get) => {
  const bridgeTransaction = get(bridgeTxAtom)
  const bridgeToken = get(selectedTokenAtom)
  const amount = get(bridgeAmountDebouncedAtom)
  const isWrapping = get(isBridgeWrappingAtom)

  if (!bridgeTransaction || !bridgeToken.address || !isWrapping) {
    return undefined
  }

  return {
    token: bridgeToken.address as Address,
    spender: bridgeTransaction.address as Address,
    amount: safeParseEther(amount),
  }
})

const ApproveBtn = () => {
  const approve = useAtomValue(approvalAtom)
  const selectedToken = useAtomValue(selectedTokenAtom)
  const { isLoading, gas, hash, write } = useContractWrite(
    approve
      ? {
          address: approve.token,
          abi: ERC20,
          functionName: 'approve',
          args: [approve.spender, approve.amount],
        }
      : undefined
  )

  const checkingAllowance = !gas.isLoading && !gas.estimateUsd

  return (
    <TransactionButton
      loading={isLoading || !!hash}
      disabled={!write || checkingAllowance}
      loadingText={hash ? 'Waiting for allowance...' : 'Sign in wallet...'}
      gas={gas}
      onClick={write}
      text={
        checkingAllowance
          ? `Verifying allowance...`
          : `Allow use of ${selectedToken.symbol}`
      }
      fullWidth
    />
  )
}

const ConfirmBridgeBtn = () => {
  const bridgeTransaction = useAtomValue(bridgeTxAtom)
  const setAmount = useSetAtom(bridgeAmountAtom)
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
  } = useContractWrite(bridgeTransaction)
  useWatchTransaction({ hash, label: 'Bridge to base' })

  const confirmLabel = useAtomValue(btnLabelAtom)

  useEffect(() => {
    if (status === 'success') {
      setAmount('')
      reset()
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

const ConfirmBridge = () => {
  const approvalRequired = useAtomValue(approvalAtom)
  const [hasAllowance] = useHasAllowance(
    approvalRequired ? [approvalRequired] : undefined
  )

  if (!hasAllowance) {
    return <ApproveBtn />
  }

  return <ConfirmBridgeBtn />
}

export default ConfirmBridge
