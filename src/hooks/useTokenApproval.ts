import { useEthers, useTransactionsContext } from '@usedapp/core'
import { BigNumberish } from 'ethers'
import { useCallback, useState } from 'react'
import { CHAIN_ID } from '../constants'
import { useTokenContract } from './useContract'

export const APPROVAL_STATUS = {
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  SUBMITTED: 'SUBMITTED',
  REJECTED: 'REJECTED',
}

const useTokensApproval = (tokens: string[]) => {
  const { account } = useEthers()
  const contractFactory = useTokenContract(tokens[0])
  const [state, setState] = useState({} as { [x: string]: string })
  const { addTransaction } = useTransactionsContext()

  const send = useCallback(
    async (spender: string, amount: BigNumberish) => {
      if (!tokens.length || !contractFactory || !account) {
        return null
      }
      let result = true
      const txState: { [x: string]: string } = {}

      for (const token of tokens) {
        try {
          txState[token] = APPROVAL_STATUS.PENDING
          setState({ ...txState })
          const contract = contractFactory.attach(token)
          const allowance = await contract.allowance(account, spender)

          if (allowance.gte(amount)) {
            txState[token] = APPROVAL_STATUS.SUBMITTED
            setState({ ...txState })
          } else {
            const tx = await contract.approve(spender, amount)

            addTransaction({
              transaction: {
                ...tx,
                chainId: CHAIN_ID,
              },
              submittedAt: Date.now(),
              transactionName: 'Approve token for issuance',
            })

            await tx.wait()
            txState[token] = APPROVAL_STATUS.SUBMITTED
            setState(txState)
          }
        } catch (e) {
          txState[token] = APPROVAL_STATUS.REJECTED
          setState(txState)
          result = false
          break // Exit the loop
        }
      }

      return result
    },
    [contractFactory, account, ...tokens]
  )

  return { send, state }
}

export default useTokensApproval
