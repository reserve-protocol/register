import { t } from '@lingui/macro'
import useDebounce from 'hooks/useDebounce'
import useTransactionCost from 'hooks/useTransactionCost'
import { atom, useSetAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { addTransactionAtom } from 'state/atoms'
import { useTransaction } from 'state/web3/hooks/useTransactions'
import { getTransactionWithGasLimit } from 'utils'
import { FACADE_WRITE_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import {
  backupCollateralAtom,
  basketAtom,
  isBasketValidAtom,
  isRevenueValidAtom,
  revenueSplitAtom,
} from '../../components/rtoken-setup/atoms'
import { getDeployParameters } from './utils'

export const deployIdAtom = atom('')

export const useDeployTx = () => {
  const {
    getValues,
    formState: { isValid },
  } = useFormContext()
  const isBasketValid = useAtomValue(isBasketValidAtom)
  const isRevenueSplitValid = useAtomValue(isRevenueValidAtom)
  const primaryBasket = useAtomValue(basketAtom)
  const backupBasket = useAtomValue(backupCollateralAtom)
  const revenueSplit = useAtomValue(revenueSplitAtom)
  const formFields = useWatch()

  return useMemo(() => {
    if (!isBasketValid || !isRevenueSplitValid || !isValid) {
      return null
    }

    const params = getDeployParameters(
      getValues(),
      primaryBasket,
      backupBasket,
      revenueSplit
    )

    if (!params) {
      return null
    }

    return {
      id: '', // Assign when running tx
      description: t`Deploy RToken`,
      status: TRANSACTION_STATUS.PENDING,
      value: '0',
      call: {
        abi: 'facadeWrite',
        address: FACADE_WRITE_ADDRESS[CHAIN_ID],
        method: 'deployRToken',
        args: params as any,
      },
    }
  }, [primaryBasket, backupBasket, revenueSplit, JSON.stringify(formFields)])
}

export const useDeployTxState = () => {
  const txId = useAtomValue(deployIdAtom)
  const tx = useTransaction(txId)

  return tx
}

const useDeploy = () => {
  const tx = useDeployTx()
  const debouncedTx = useDebounce(tx, 100)
  const setTxId = useUpdateAtom(deployIdAtom)
  const addTransaction = useSetAtom(addTransactionAtom)
  const [fee, gasError, gasLimit] = useTransactionCost(
    debouncedTx ? [debouncedTx] : [] // use debounceTx to avoid too many requests
  )
  const isValid = !!tx

  const handleDeploy = useCallback(() => {
    if (tx) {
      const id = uuid()
      addTransaction([{ ...getTransactionWithGasLimit(tx, gasLimit), id }])
      setTxId(id)
    }
  }, [tx, gasLimit, addTransaction])

  return useMemo(
    () => ({
      fee,
      error: gasError,
      isValid,
      deploy: handleDeploy,
    }),
    [fee, gasError, handleDeploy, isValid]
  )
}

export default useDeploy
