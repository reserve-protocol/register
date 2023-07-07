import { t } from '@lingui/macro'
import { setupRolesAtom } from 'components/rtoken-setup/atoms'
import { BigNumber } from 'ethers'
import useDebounce from 'hooks/useDebounce'
import useRToken from 'hooks/useRToken'
import useTransactionCost from 'hooks/useTransactionCost'
import { useAtomValue, useSetAtom } from 'jotai'
import { atomWithReset } from 'jotai/utils'
import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { addTransactionAtom, chainIdAtom } from 'state/atoms'
import { useTransactionState } from 'state/chain/hooks/useTransactions'
import { getTransactionWithGasLimit } from 'utils'
import { FACADE_WRITE_ADDRESS, ZERO_ADDRESS } from 'utils/addresses'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'

export const governanceIdAtom = atomWithReset('')

export const useGovernanceTx = () => {
  const {
    getValues,
    formState: { isValid },
  } = useFormContext()
  const formFields = useWatch()
  const roles = useAtomValue(setupRolesAtom)
  const rToken = useRToken()
  const chainId = useAtomValue(chainIdAtom)

  return useMemo(() => {
    try {
      const {
        defaultGovernance,
        unpause,
        votingDelay,
        votingPeriod,
        proposalThresholdAsMicroPercent,
        quorumPercent,
        minDelay,
        guardian,
        owner,
      } = getValues()

      if (
        !rToken?.address ||
        (defaultGovernance && !guardian) ||
        (!defaultGovernance && !owner)
      ) {
        return null
      }

      const govConfig = {
        votingDelay: BigNumber.from(votingDelay),
        votingPeriod: BigNumber.from(votingPeriod),
        proposalThresholdAsMicroPercent: BigNumber.from(
          +proposalThresholdAsMicroPercent * 1e6
        ),
        quorumPercent: BigNumber.from(quorumPercent),
        timelockDelay: BigNumber.from(minDelay * 60 * 60),
      }
      const args = [
        rToken.address,
        !!defaultGovernance,
        unpause === '1',
        govConfig,
        {
          owner: defaultGovernance ? ZERO_ADDRESS : owner,
          guardian,
          ...roles,
        },
      ]

      return {
        id: '',
        description: t`Setup Governance`,
        status: TRANSACTION_STATUS.PENDING,
        value: '0',
        call: {
          abi: 'facadeWrite',
          address: FACADE_WRITE_ADDRESS[chainId],
          method: 'setupGovernance',
          args,
        },
      }
    } catch (e) {
      console.error('Error setting up tx', e)
      return null
    }
  }, [
    JSON.stringify(formFields),
    JSON.stringify(roles),
    rToken?.address,
    isValid,
    chainId,
  ])
}

export const useGovernanceTxState = () => {
  const txId = useAtomValue(governanceIdAtom)
  const tx = useTransactionState(txId)

  return tx
}

const useGovernance = () => {
  const tx = useGovernanceTx()
  const debouncedTx = useDebounce(tx, 100)
  const setTxId = useSetAtom(governanceIdAtom)
  const addTransaction = useSetAtom(addTransactionAtom)

  const [fee, gasError, gasLimit] = useTransactionCost(
    debouncedTx ? [debouncedTx] : [] // use debounceTx to avoid too many requests
  )
  const isValid = !!tx

  const handleGovernance = useCallback(() => {
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
      deploy: handleGovernance,
    }),
    [fee, gasError, handleGovernance, isValid]
  )
}

export default useGovernance
