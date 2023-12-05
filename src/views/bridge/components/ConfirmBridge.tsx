import ERC20 from 'abis/ERC20'
import { Modal } from 'components'
import TransactionButton from 'components/button/TransactionButton'
import useContractWrite from 'hooks/useContractWrite'
import useHasAllowance from 'hooks/useHasAllowance'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useCallback, useEffect, useState } from 'react'
import { Box, Divider, Spinner, Text } from 'theme-ui'
import { safeParseEther } from 'utils'
import { Address } from 'viem'
import {
  bridgeAmountAtom,
  bridgeAmountDebouncedAtom,
  bridgeTxAtom,
  isBridgeWrappingAtom,
  selectedBridgeToken,
} from '../atoms'
import ChainLogo from 'components/icons/ChainLogo'
import { ChainId } from 'utils/chains'
import { Trans } from '@lingui/macro'

const btnLabelAtom = atom((get) => {
  const token = get(selectedBridgeToken)
  const isWrapping = get(isBridgeWrappingAtom)

  return `${isWrapping ? 'Deposit' : 'Withdraw'} ${
    isWrapping ? token.L1symbol : token.L2symbol
  } to ${isWrapping ? 'Base' : 'Ethereum'}`
})

const approvalAtom = atom((get) => {
  const bridgeTransaction = get(bridgeTxAtom)
  const bridgeToken = get(selectedBridgeToken)
  const amount = get(bridgeAmountDebouncedAtom)
  const isWrapping = get(isBridgeWrappingAtom)

  if (!bridgeTransaction || !bridgeToken.L1contract || !isWrapping) {
    return undefined
  }

  return {
    token: isWrapping
      ? bridgeToken.L1contract
      : (bridgeToken.L2contract as Address),
    spender: bridgeTransaction.address as Address,
    amount: safeParseEther(amount),
  }
})

const ApproveBtn = () => {
  const approve = useAtomValue(approvalAtom)
  const selectedToken = useAtomValue(selectedBridgeToken)
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
          : `Allow use of ${selectedToken.L1symbol}`
      }
      fullWidth
    />
  )
}

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
  } = useContractWrite(bridgeTransaction)
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

const steps = [
  { title: 'Sending request', subtitle: 'Takes up to 1hr', disclaimer: false },
  { title: 'Verify', subtitle: 'Takes up to 7d', disclaimer: true },
  { title: 'Completes', subtitle: 'Takes up to 1hr', disclaimer: true },
]

const WithdrawInfo = ({ onClose }: { onClose(): void }) => {
  return (
    <Modal onClose={onClose}>
      <Box>
        <Box variant="layout.verticalAlign" mb={3}>
          <ChainLogo width={24} height={24} chain={ChainId.Base} />
          <Spinner size={14} mx={2} />
          <ChainLogo width={24} height={24} chain={ChainId.Mainnet} />
        </Box>
        <Text variant="sectionTitle">Withdrawal in progress</Text>
      </Box>
      <Divider my={4} mx={-4} />
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
          {step.disclaimer && (
            <Text sx={{ fontSize: 0 }} variant="warning" ml="auto">
              <Trans>Requires tx on Ethereum</Trans>
            </Text>
          )}
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
