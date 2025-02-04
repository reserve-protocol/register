import dtfIndexStakingVault from '@/abis/dtf-index-staking-vault'
import TransactionButton from '@/components/old/button/TransactionButton'
import useContractWrite from '@/hooks/useContractWrite'
import { walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { useResetAtom } from 'jotai/utils'
import { useEffect } from 'react'
import { erc20Abi, parseUnits } from 'viem'
import { useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import {
  lockCheckboxAtom,
  stakingInputAtom,
  stakingSidebarOpenAtom,
  underlyingBalanceAtom,
} from '../atoms'
import { portfolioSidebarOpenAtom } from '@/views/portfolio/atoms'

const SubmitLockButton = () => {
  const account = useAtomValue(walletAtom)
  const stToken = useAtomValue(indexDTFAtom)!.stToken!
  const input = useAtomValue(stakingInputAtom)
  const balance = useAtomValue(underlyingBalanceAtom)
  const amountToLock = parseUnits(input, stToken.underlying.decimals)
  const checkbox = useAtomValue(lockCheckboxAtom)
  const resetInput = useResetAtom(stakingInputAtom)
  const setPortfolioSidebarOpen = useSetAtom(portfolioSidebarOpenAtom)
  const setStakingSidebarOpen = useSetAtom(stakingSidebarOpenAtom)

  const {
    data: allowance,
    isLoading: validatingAllowance,
    error: allowanceError,
  } = useReadContract({
    abi: erc20Abi,
    functionName: 'allowance',
    address: stToken.underlying.address,
    args: [account!, stToken.id],
    query: { enabled: !!account },
  })

  const hasAllowance = (allowance || 0n) >= amountToLock

  const {
    write: approve,
    isReady: approvalReady,
    gas: approvalGas,
    isLoading: approving,
    hash: approvalHash,
    error: approvalError,
    validationError: approvalValidationError,
  } = useContractWrite({
    abi: erc20Abi,
    address: stToken.underlying.address,
    functionName: 'approve',
    args: [stToken.id, amountToLock],
    query: {
      enabled: !hasAllowance && !!balance && amountToLock <= balance,
    },
  })

  const { data: approvalReceipt, error: approvalTxError } =
    useWaitForTransactionReceipt({
      hash: approvalHash,
    })

  const readyToSubmit = hasAllowance || approvalReceipt?.status === 'success'

  const { isReady, gas, hash, validationError, error, isLoading, write } =
    useContractWrite({
      abi: dtfIndexStakingVault,
      functionName: 'depositAndDelegate',
      address: stToken.id,
      args: [amountToLock],
      query: { enabled: readyToSubmit },
    })

  const { data: receipt, error: txError } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (receipt?.status === 'success') {
      resetInput()
      setStakingSidebarOpen(false)
      setPortfolioSidebarOpen(true)
    }
  }, [receipt])

  return (
    <div>
      <TransactionButton
        disabled={
          !checkbox ||
          receipt?.status === 'success' ||
          amountToLock === 0n ||
          (readyToSubmit ? !isReady : !approvalReady)
        }
        gas={readyToSubmit ? gas : approvalGas}
        loading={
          !receipt &&
          (readyToSubmit
            ? isLoading || !!hash || (hash && !receipt)
            : approving ||
              !!approvalHash ||
              validatingAllowance ||
              (approvalHash && !approvalReceipt))
        }
        loadingText={!!hash ? 'Confirming tx...' : 'Pending, sign in wallet'}
        onClick={readyToSubmit ? write : approve}
        text={
          receipt?.status === 'success'
            ? 'Transaction confirmed'
            : readyToSubmit
              ? `Vote lock ${stToken.underlying.symbol}`
              : `Approve use of ${stToken.underlying.symbol}`
        }
        fullWidth
        error={
          readyToSubmit
            ? validationError || error || txError
            : approvalError ||
              approvalValidationError ||
              approvalTxError ||
              allowanceError
        }
      />
    </div>
  )
}

export default SubmitLockButton
