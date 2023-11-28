import ERC20 from 'abis/ERC20'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useHasAllowance from 'hooks/useHasAllowance'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { safeParseEther } from 'utils'
import { Address } from 'viem'
import {
  bridgeAmountAtom,
  bridgeAmountDebouncedAtom,
  bridgeTxAtom,
  isBridgeWrappingAtom,
  selectedBridgeToken,
  selectedTokenAtom,
} from '../atoms'
import { Modal } from 'components'
import { Box, Divider, Text } from 'theme-ui'
import mixpanel from 'mixpanel-browser'

const btnLabelAtom = atom((get) => {
  const token = get(selectedBridgeToken)
  const isWrapping = get(isBridgeWrappingAtom)

  return `${isWrapping ? 'Deposit' : 'Withdraw'} ${
    isWrapping ? token.L1symbol : token.L2symbol
  } to ${isWrapping ? 'Base' : 'Ethereum'}`
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

const ConfirmBridgeBtn = ({ onSuccess }: { onSuccess(): void }) => {
  const bridgeTransaction = useAtomValue(bridgeTxAtom)
  const bridgeToken = useAtomValue(selectedTokenAtom)
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
  } = useContractWrite(bridgeTransaction)
  useWatchTransaction({ hash, label: 'Bridge to base' })

  const confirmLabel = useAtomValue(btnLabelAtom)

  useEffect(() => {
    if (status === 'success') {
      mixpanel.track('Bridge Success', {
        Token: bridgeToken.symbol,
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

const steps = [
  { title: 'Sending request', subtitle: 'Takes up to 1hr' },
  { title: 'Verify', subtitle: 'Takes up to 7d' },
  { title: 'Completes', subtitle: 'Takes up to 1hr' },
]

const WithdrawInfo = ({ onClose }: { onClose(): void }) => {
  return (
    <Modal title="Withdrawal in progress" onClose={onClose}>
      {steps.map((step, index) => (
        <Box variant="layout.verticalAlign" mb={3} key={step.title}>
          <Box
            sx={{
              textAlign: 'center',
              backgroundColor: 'darkBorder',
              width: '20px',
              height: '20px',
              borderRadius: '100%',
              fontSize: 1,
            }}
          >
            {index + 1}
          </Box>
          <Box ml={3}>
            <Text variant="strong">{step.title}</Text>
            <Text variant="legend">{step.subtitle}</Text>
          </Box>
        </Box>
      ))}
      <Divider mx={-4} />
      <Text variant="legend" as="p" sx={{ fontSize: 1 }}>
        In order to minimize security risk, withdrawals take up to 7 days. After
        the withdrawal request is proposed onchain (within 1hr) you must verify
        and complete the transaction in order to access your funds.
      </Text>
    </Modal>
  )
}

const ConfirmBridge = () => {
  const approvalRequired = useAtomValue(approvalAtom)
  const [hasAllowance] = useHasAllowance(
    approvalRequired ? [approvalRequired] : undefined
  )
  const isWrapping = useAtomValue(isBridgeWrappingAtom)
  const [showModal, setModal] = useState(false)

  const handleSuccess = useCallback(() => {
    if (!isWrapping) {
      setModal(true)
    }
  }, [isWrapping])

  return (
    <Box p={4}>
      {showModal && <WithdrawInfo onClose={() => setModal(false)} />}
      {!hasAllowance ? (
        <ApproveBtn />
      ) : (
        <ConfirmBridgeBtn onSuccess={handleSuccess} />
      )}
    </Box>
  )
}

export default ConfirmBridge
