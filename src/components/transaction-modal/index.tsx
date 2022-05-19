import { BigNumber } from '@ethersproject/bignumber'
import { formatEther } from '@ethersproject/units'
import Button from 'components/button'
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
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { Box, Divider, Flex, Spinner, Text } from 'theme-ui'
import { BigNumberMap, TransactionState } from 'types'
import { formatCurrency, hasAllowance } from 'utils'
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
  isValid: boolean
}

const ApprovalTransactions = ({
  txs,
  title,
}: {
  txs: TransactionState[]
  title: string
}) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const [signing, setSigning] = useState(false)
  const [gasEstimates, setGasEstimates] = useState([] as BigNumber[])
  const [fee, setFee] = useState(0)
  const tokenContract = useTokenContract(txs[0]?.call.address, true)!
  const gasPrice = useAtomValue(gasPriceAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const blockNumber = useBlockNumber()

  const handleApprove = () => {
    if (signing) return
    addTransaction(txs.filter((tx) => tx.status === TRANSACTION_STATUS.PENDING))
    setSigning(true)
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

  return (
    <Box mt={3}>
      <Button sx={{ width: '100%' }} variant="accent" onClick={handleApprove}>
        {signing ? (
          <Text
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spinner color="black" marginRight={10} size={20} />
            Pending, sign in wallet
          </Text>
        ) : (
          <Text>{title}</Text>
        )}
      </Button>
      <Box mt={2} sx={{ fontSize: 1, textAlign: 'center' }}>
        <Text mr={1}>Estimated gas cost:</Text>
        {gasEstimates.length > 0 ? (
          <Text sx={{ fontWeight: 500 }}>${formatCurrency(fee)}</Text>
        ) : (
          <Spinner color="black" size={12} />
        )}
      </Box>
    </Box>
  )
}

const TransactionConfirmed = ({ onClose }: { onClose: () => void }) => (
  <Modal onClose={onClose} title=" " style={{ width: '400px' }}>
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
}: ITransactionModal) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const allowances = useAtomValue(allowanceAtom)
  const [signing, setSigning] = useState(false)
  const [approvalsTx, setApprovalsTx] = useState([] as TransactionState[])
  const approvalsNeeded = useMemo(
    () => approvalsTx.some((tx) => tx.status === TRANSACTION_STATUS.PENDING),
    [approvalsTx]
  )
  const canSubmit = useMemo(
    () => isValid && hasAllowance(allowances, requiredAllowance),
    [allowances, requiredAllowance]
  )
  const txState = useTransaction(signing ? tx.id : '')
  const signed =
    signing &&
    txState?.call.method === 'issue' &&
    txState.status !== TRANSACTION_STATUS.PENDING &&
    txState.status !== TRANSACTION_STATUS.SIGNING

  const handleConfirm = () => {
    setSigning(true)
    addTransaction([tx])
  }

  useEffect(() => {
    if (
      buildApprovals &&
      Object.keys(allowances).length &&
      Object.keys(requiredAllowance).length
    ) {
      setApprovalsTx(buildApprovals(requiredAllowance, allowances))
    } else {
      setApprovalsTx([])
    }
  }, [allowances, requiredAllowance])

  if (signed) {
    return <TransactionConfirmed onClose={onClose} />
  }

  return (
    <Modal
      title={!signed ? title : ' '}
      onClose={onClose}
      style={{ width: '400px' }}
    >
      {children}
      {approvalsNeeded && !canSubmit && (
        <>
          <Divider mx={-3} mt={3} />
          <ApprovalTransactions
            title={approvalsLabel ?? 'Approve'}
            txs={approvalsTx}
          />
        </>
      )}
      <Divider mx={-3} mt={3} />
      <Button
        sx={{ width: '100%' }}
        disabled={!canSubmit}
        variant={signing ? 'accent' : 'primary'}
        mt={2}
        onClick={handleConfirm}
      >
        {signing ? (
          <Text
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spinner color="black" marginRight={10} size={20} />
            Pending, sign in wallet
          </Text>
        ) : (
          <Text>{confirmLabel}</Text>
        )}
      </Button>
    </Modal>
  )
}

export default TransactionModal
