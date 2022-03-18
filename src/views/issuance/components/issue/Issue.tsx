import styled from '@emotion/styled'
import { BigNumber } from '@ethersproject/bignumber'
import { Box, Card, Text } from '@theme-ui/components'
import { ERC20Interface, MainInterface, RSVManagerInterface } from 'abis'
import { Button, NumericalInput } from 'components'
import { formatEther, parseEther } from 'ethers/lib/utils'
import { useMainContract } from 'hooks/useContract'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  loadTransactions,
  TransactionState,
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { useAppSelector } from 'state/hooks'
import { selectBalanceAggregate } from 'state/reserve-tokens/reducer'
import { ReserveToken } from 'types'
import { getIssuable, quote } from 'utils/rsv'

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
  const transactions: TransactionState[] = data.basket.collaterals.map(
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

const useTokenIssuableAmount = (data: ReserveToken) => {
  const [amount, setAmount] = useState(0)
  const balance = useSelector(selectBalanceAggregate)
  const tokenBalances = useAppSelector((state) => state.reserveTokens.balances)

  useEffect(() => {
    if (data.isRSV) {
      setAmount(getIssuable(data, tokenBalances))
    } else {
      // TODO: quote
    }
  }, [balance, data.id])

  return amount
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
const Issue = ({ data, ...props }: { data: ReserveToken }) => {
  const [amount, setAmount] = useState('')
  const [issuing, setIssuing] = useState(false)
  const mainContract = useMainContract(data.id)
  const [, dispatch] = useTransactionsState()
  const issuableAmount = useTokenIssuableAmount(data)

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

      if (!quantities) throw new Error()

      setAmount('')
      loadTransactions(dispatch, buildTransactions(data, amount, quantities))
    } catch (e) {
      // TODO: Handle error case
      console.log('failed doing issuance', e)
    }

    setIssuing(false)
  }

  const isValid = () => {
    const value = Number(amount)
    return value > 0 && value <= issuableAmount
  }

  return (
    <Card {...props}>
      <InputContainer m={3}>
        <Text as="label" variant="contentTitle" mb={2}>
          Mint
        </Text>
        <NumericalInput
          id="mint"
          placeholder="Mint amount"
          value={amount}
          onChange={setAmount}
        />
        <Text
          onClick={() => setAmount(issuableAmount.toString())}
          as="a"
          variant="a"
          sx={{ marginLeft: 'auto', marginTop: 1 }}
        >
          Max: {issuableAmount}
        </Text>
        <Button disabled={!isValid() || issuing} mt={2} onClick={handleIssue}>
          + Mint {data.token.symbol}
        </Button>
      </InputContainer>
    </Card>
  )
}

export default Issue
