import { BigNumber } from '@ethersproject/bignumber'
import { formatEther } from '@ethersproject/units'
import Button, { LoadingButton } from 'components/button'
import Modal from 'components/modal'
import useBlockNumber from 'hooks/useBlockNumber'
import { useTokenContract } from 'hooks/useContract'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle } from 'react-feather'
import {
  addTransactionAtom,
  allowanceAtom,
  ethPriceAtom,
  gasPriceAtom,
} from 'state/atoms'
import {
  useTransaction,
  useTransactions,
} from 'state/web3/hooks/useTransactions'
import { Box, Divider, Flex, Spinner, Text } from 'theme-ui'
import { BigNumberMap, TransactionState } from 'types'
import { formatCurrency, hasAllowance } from 'utils'
import { v4 as uuid } from 'uuid'
import { TRANSACTION_STATUS } from 'utils/constants'

export interface ITransactionModal {
  title: string
  children: any
  tx: TransactionState
  requiredAllowance: BigNumberMap
  confirmLabel: string
  approvalsLabel?: string
  buildApprovals?: (
    required: BigNumberMap,
    allowances: BigNumberMap
  ) => TransactionState[]
  onClose: () => void
  onChange?(signing: boolean): void
  isValid: boolean
}

const TransactionError = ({
  onClose,
  title,
  subtitle,
}: {
  onClose(): void
  title?: string
  subtitle?: string
}) => {
  return (
    <>
      <Box
        sx={{
          opacity: '95%',
          backgroundColor: 'background',
          position: 'absolute',
          height: '100%',
          width: '100%',
          top: 0,
          left: 0,
          borderRadius: 16,
        }}
      />
      <Flex
        sx={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          top: 0,
          left: 0,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          borderRadius: 16,
        }}
      >
        <Text mb={2} variant="sectionTitle">
          {title}
        </Text>
        <Text mb={4} variant="legend">
          {subtitle}
        </Text>
        <Button px={4} onClick={onClose}>
          Dismiss
        </Button>
      </Flex>
    </>
  )
}

const ApprovalTransactions = ({
  txs,
  title,
  onConfirm,
  onError,
}: {
  txs: TransactionState[]
  title: string
  onConfirm(): void
  onError(): void
}) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const [signing, setSigning] = useState(false)
  const [gasEstimates, setGasEstimates] = useState([] as BigNumber[])
  const [fee, setFee] = useState(0)
  const tokenContract = useTokenContract(txs[0]?.call.address, true)!
  const gasPrice = useAtomValue(gasPriceAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const blockNumber = useBlockNumber()
  const txState = useTransactions(signing ? txs.map((tx) => tx.id) : [])
  const failedTx = useMemo(() => {
    if (signing) {
      return txState.find((tx) => tx.status === TRANSACTION_STATUS.REJECTED)
    }

    return undefined
  }, [JSON.stringify(txState)])

  const handleApprove = () => {
    setSigning(true)
    addTransaction(txs)
    onConfirm()
  }

  const fetchGasEstimate = useCallback(async () => {
    try {
      let totalFee = 0
      const estimates = await Promise.all(
        txs.map(async (tx) => {
          const contract = tokenContract.attach(tx.call.address)
          const estimate = await contract.estimateGas.approve(
            tx.call.args[0],
            tx.call.args[1]
          )
          totalFee += +formatEther(estimate)
          return estimate
        })
      )

      setGasEstimates(estimates)
      setFee(totalFee * gasPrice * ethPrice)
    } catch (e) {
      console.error('error fetching gas estimate', e)
    }
  }, [txs])

  useEffect(() => {
    if (txs.length && blockNumber) {
      fetchGasEstimate()
    }
  }, [blockNumber, JSON.stringify(txs)])

  const handleRetry = () => {
    onError()
    setSigning(false)
  }

  return (
    <>
      {!!failedTx && (
        <TransactionError
          title="Transaction failed"
          subtitle={failedTx.description}
          onClose={handleRetry}
        />
      )}
      <Box mt={3}>
        <LoadingButton
          loading={signing}
          text={title}
          onClick={handleApprove}
          sx={{ width: '100%' }}
        />
        <Box mt={2} sx={{ fontSize: 1, textAlign: 'center' }}>
          <Text mr={1}>Estimated gas cost:</Text>
          {gasEstimates.length > 0 ? (
            <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
          ) : (
            <Spinner color="black" size={12} />
          )}
        </Box>
      </Box>
    </>
  )
}

const TransactionConfirmed = ({ onClose }: { onClose(): void }) => (
  <Modal onClose={onClose} style={{ width: '400px' }}>
    <Flex
      p={4}
      sx={{
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <CheckCircle size={36} />
      <br />
      <Text>Transaction signed!</Text>
    </Flex>
  </Modal>
)

const TransactionModal = ({
  title,
  requiredAllowance,
  tx,
  children,
  isValid,
  confirmLabel,
  approvalsLabel,
  buildApprovals,
  onClose,
  onChange = () => {},
}: ITransactionModal) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const allowances = useAtomValue(allowanceAtom)
  const [signing, setSigning] = useState('')
  const [approvalsTx, setApprovalsTx] = useState([] as TransactionState[])
  const requiredApprovals = useMemo(
    () => approvalsTx.filter((tx) => tx.status === TRANSACTION_STATUS.PENDING),
    [approvalsTx]
  )
  const canSubmit = useMemo(
    () => isValid && hasAllowance(allowances, requiredAllowance),
    [allowances, requiredAllowance]
  )
  const txState = useTransaction(signing)
  const signed =
    txState?.status === TRANSACTION_STATUS.MINING ||
    txState?.status === TRANSACTION_STATUS.CONFIRMED

  const handleConfirm = () => {
    const id = uuid()
    setSigning(id)
    onChange(true)
    addTransaction([{ ...tx, id }])
  }

  // TODO: Handle retry
  // TODO: Reset state, and make sure the new tx array have new uuids
  // TODO: Signing and error state can be shared? so restarting is easier
  const handleRetry = () => {
    setSigning('')
    onChange(false)
  }

  const fetchApprovals = () => {
    if (
      buildApprovals &&
      Object.keys(allowances).length &&
      Object.keys(requiredAllowance).length
    ) {
      setApprovalsTx(buildApprovals(requiredAllowance, allowances))
    } else {
      setApprovalsTx([])
    }
  }

  useEffect(fetchApprovals, [allowances, requiredAllowance])

  if (signed) {
    return <TransactionConfirmed onClose={onClose} />
  }

  return (
    <Modal
      title={!signed ? title : undefined}
      onClose={onClose}
      style={{ width: '400px' }}
    >
      {txState?.status === TRANSACTION_STATUS.REJECTED && (
        <TransactionError
          title="Transaction failed"
          subtitle={txState.description}
          onClose={handleRetry}
        />
      )}
      {children}
      {requiredApprovals.length > 0 && !canSubmit && (
        <>
          <Divider mx={-4} mt={3} />
          <ApprovalTransactions
            onConfirm={() => onChange(true)}
            onError={() => {
              onChange(false)
              fetchApprovals()
            }}
            title={approvalsLabel ?? 'Approve'}
            txs={requiredApprovals}
          />
        </>
      )}
      <Divider mx={-4} mt={3} />
      <LoadingButton
        loading={!!signing}
        disabled={!canSubmit}
        variant={!!signing ? 'accent' : 'primary'}
        text={confirmLabel}
        onClick={handleConfirm}
        sx={{ width: '100%' }}
        mt={2}
      />
    </Modal>
  )
}

export default TransactionModal
