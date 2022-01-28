import styled from '@emotion/styled'
import { BigNumber } from '@ethersproject/bignumber'
import { Box } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import { ERC20Interface, MainInterface, RSVManagerInterface } from 'abis'
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
import { ReserveToken } from 'types'
import { quote } from 'utils/rsv'

const InputContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

/**
 * Build issuance required transactions
 *
 * @param data <ReserveToken>
 * @param amount <string>
 * @param quantities <BigNumber[]>
 * @returns TransactionState[]
 */
const buildTransactions = (
  data: ReserveToken,
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
          method: 'approve',
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
      abi: data.isRSV ? RSVManagerInterface : MainInterface,
      address: data.id,
      method: 'issue',
      args: [parseEther(amount)],
    },
  })

  return transactions
}

// const canIssue = async () => {
//   // Check for MaxSupply hit
//   const maxSupply = drizzle.web3.utils.toBN(
//     drizzleState.contracts.Reserve.maxSupply[this.state.rsv.maxSupply].value
//   )
//   const totalSupply = drizzle.web3.utils.toBN(
//     drizzleState.contracts.Reserve.totalSupply[this.state.rsv.totalSupply].value
//   )
//   const cur = drizzle.web3.utils
//     .toBN(this.state.generate.cur)
//     .mul(util.EIGHTEEN)
//   if (totalSupply.add(cur).gt(maxSupply)) {
//     alert('Sorry, RSV is at max supply')
//     return
//   }
// }

/**
 * Issuance
 * Handles issuance, creates the set of transactions that will be later handled by the container
 * @required TransactionManager context
 *
 * @returns React.Component
 */
// TODO: Validations
// TODO: Get max issuable quantity from view function (protocol)
const Issue = ({ data, ...props }: { data: ReserveToken }) => {
  const { library } = useEthers()
  const [amount, setAmount] = useState('')
  const [issuing, setIssuing] = useState(false)
  const mainContract = useMainContract(data.id)
  const [, dispatch] = useTransactionsState()

  const handleIssue = async () => {
    setIssuing(true)
    try {
      const issueAmount = parseEther(amount)
      let quantities

      // RSV have hardcoded quantities
      if (data.isRSV) {
        quantities = quote(issueAmount)
      } else {
        quantities = await mainContract?.quote(issueAmount)
      }

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
  )
}

export default Issue
