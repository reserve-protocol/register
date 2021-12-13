import styled from '@emotion/styled'
import { BigNumber } from '@ethersproject/bignumber'
import { Box } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import { ERC20Interface, MainInterface } from 'abis'
import { Button, Input } from 'components'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { useMainContract } from 'hooks/useContract'
import { useState } from 'react'
import {
  loadTransactions,
  TransactionState,
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { IReserveToken } from 'state/reserve-tokens/reducer'
import IssuanceWorker, { TRANSACTION_TYPES } from './IssuanceWorker'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

/**
 * Build issuance required transactions
 *
 * @param data <IReserveToken>
 * @param amount <string>
 * @param quantities <BigNumber[]>
 * @returns TransactionState[]
 */
const buildTransactions = (
  data: IReserveToken,
  amount: string,
  quantities: BigNumber[]
): TransactionState[] => {
  const tokenQuantities: [string, BigNumber][] = []

  // Create token approvals calls array
  const transactions: TransactionState[] = data.vault.collaterals.map(
    ({ token, index }) => {
      const description = `Approve ${token.symbol} for issuance`
      const tokenAmount = quantities[index]
      // Fill token quantities on the same map
      tokenQuantities.push([token.address, tokenAmount])

      return {
        autoCall: false,
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
    }
  )
  // Create token issuance contract call
  transactions.push({
    autoCall: false,
    description: `Issue ${amount} ${data.token.symbol}`,
    status: TX_STATUS.PENDING,
    value: amount,
    extra: tokenQuantities, // Send quantities as an extra prop for allowance check before issuance
    call: {
      abi: MainInterface,
      address: data.id,
      method: TRANSACTION_TYPES.ISSUE,
      args: [parseEther(amount)],
    },
  })

  return transactions
}

/**
 * Issuance
 * Handles issuance, creates the set of transactions that will be later handled by the container
 * @required TransactionManager context
 *
 * @returns React.Component
 */
// TODO: Validations
// TODO: Get max issuable quantity from view function (protocol)
const Issue = ({ data, ...props }: { data: IReserveToken }) => {
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

      if (!quantities || !library) throw new Error()

      setAmount('')
      loadTransactions(dispatch, buildTransactions(data, amount, quantities))
    } catch (e) {
      // TODO: Handle error case
      console.log('failed doing issuance', e)
    }

    setIssuing(false)
  }

  return (
    <>
      {currentTransaction && <IssuanceWorker current={currentTransaction} />}
      <InputContainer mx={2} {...props}>
        <Input
          placeholder="Mint amount"
          label="Mint ammount"
          value={amount}
          onChange={setAmount}
        />
        <Button mt={2} disabled={issuing} onClick={handleIssue}>
          Mint
        </Button>
      </InputContainer>
    </>
  )
}

export default Issue
