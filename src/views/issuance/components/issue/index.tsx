import styled from '@emotion/styled'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Box } from '@theme-ui/components'
import { useContractFunction, useEthers } from '@usedapp/core'
import { ERC20Interface, MainInterface } from 'abis'
import { ERC20 as IERC20 } from 'abis/types'
import { Button, Input } from 'components'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { useContract, useMainContract } from 'hooks/useContract'
import useTokensHasAllowance from 'hooks/useTokensHasAllowance'
import React, { useEffect, useState } from 'react'
import {
  loadTransactions,
  setTransactionHash,
  TransactionState,
  TX_STATUS,
  updateTransactionStatus,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { IReserveToken } from 'state/reserve-tokens/reducer'

const TRANSACTION_TYPES = {
  APPROVE: 'approve',
  ISSUE: 'issue',
}

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

// TODO: assign hash
/**
 * Handle issuance related transactions
 */
const IssuanceTransaction = React.memo(
  ({ current }: { current: TransactionState }) => {
    const { account } = useEthers()
    const contract = useContract(
      current.call.address,
      current.call.abi,
      false
    ) as Contract
    const [, dispatch] = useTransactionsState()
    const { state, send } = useContractFunction(contract, current.call.method, {
      transactionName: current.description,
    })
    const hasAllowance = useTokensHasAllowance(
      current.call.method === TRANSACTION_TYPES.ISSUE ? current.extra : [],
      current.call.address || ''
    )

    useEffect(() => {
      const processTransaction = async () => {
        if (current.call.method === TRANSACTION_TYPES.APPROVE) {
          const allowance = await (contract as IERC20).allowance(
            account as string,
            current.call.args[0]
          )

          if (allowance.gte(current.call.args[1])) {
            updateTransactionStatus(dispatch, TX_STATUS.SKIPPED)
          } else {
            send(...current.call.args)
            updateTransactionStatus(dispatch, TX_STATUS.PROCESSING)
          }
        } else {
          send(...current.call.args)
          updateTransactionStatus(dispatch, TX_STATUS.PROCESSING)
        }
      }

      if (current.status === TX_STATUS.PENDING) {
        processTransaction()
      }
    }, [contract, hasAllowance])

    useEffect(() => {
      if (!current.hash && state.transaction?.hash) {
        setTransactionHash(dispatch, state.transaction.hash)
      }

      if (state.status === 'Success') {
        updateTransactionStatus(dispatch, TX_STATUS.SUBMITTED)
      }

      if (state.status === 'Exception' || state.status === 'Fail') {
        updateTransactionStatus(dispatch, TX_STATUS.FAILED)
      }
    }, [state.status])

    return null
  }
)

/**
 * Issuance
 * Handles issuance, creates the set of transactions that will be later handled by the container
 * @required TransactionManager context
 *
 * @returns React.Component
 */
// TODO: Validations
// TODO: Get max issuable quantity from view function (protocol)
const Issue = ({
  data,
  onIssue,
  ...props
}: {
  data: IReserveToken
  onIssue: (amount: number) => void
}) => {
  const { library } = useEthers()
  const [amount, setAmount] = useState('')
  const [issuing, setIssuing] = useState(false)
  const mainContract = useMainContract(data.id)
  const [txState, dispatch] = useTransactionsState()
  const currentTransaction = txState.list[txState.current]

  const handleIssue = async () => {
    setIssuing(true)
    try {
      const issueAmount = parseEther(amount)
      const quantities = await mainContract?.quote(issueAmount)
      const tokenQuantities: [string, BigNumber][] = []

      if (!quantities || !library) throw new Error()

      // Create token approvals calls array
      const tokenApprovals = data.vault.collaterals.map(({ token, index }) => {
        const description = `Approve ${token.symbol} for issuance`
        const tokenAmount = quantities[index]
        // Fill token quantities on the same map
        tokenQuantities.push([token.address, tokenAmount])

        return {
          description,
          status: TX_STATUS.PENDING,
          value: formatEther(quantities[index]),
          call: {
            abi: ERC20Interface,
            address: token.address,
            method: TRANSACTION_TYPES.APPROVE,
            args: [data.id, tokenAmount],
          },
        }
      })
      // Create token issuance contract call
      const tokenIssuance = {
        description: `Issue ${amount} ${data.rToken.symbol}`,
        status: TX_STATUS.PENDING,
        value: amount,
        extra: tokenQuantities, // Send quantities as an extra prop for allowance check before issuance
        call: {
          abi: MainInterface,
          address: data.id,
          method: TRANSACTION_TYPES.ISSUE,
          args: [parseEther(amount)],
        },
      }

      // Load token approvals + issuance
      setAmount('')
      loadTransactions(dispatch, [...tokenApprovals, tokenIssuance])
    } catch (e) {
      // TODO: Handle error case
      console.log('failed doing issuance', e)
    }

    setIssuing(false)
  }

  const handleChange = (value: string) => {
    setAmount(value)
  }

  return (
    <>
      {currentTransaction && (
        <IssuanceTransaction current={currentTransaction} />
      )}
      <InputContainer mx={2} {...props}>
        <Input
          placeholder="Mint amount"
          label="Mint ammount"
          value={amount}
          onChange={handleChange}
        />
        <Button mt={2} disabled={issuing} onClick={handleIssue}>
          Mint
        </Button>
      </InputContainer>
    </>
  )
}

export default Issue
