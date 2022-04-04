import styled from '@emotion/styled'
import { BigNumber } from '@ethersproject/bignumber'
import { Box, Card, Text } from '@theme-ui/components'
import { useEthers } from '@usedapp/core'
import { ERC20Interface, RSVManagerInterface, RTokenInterface } from 'abis'
import { Button, NumericalInput } from 'components'
import {
  formatEther,
  formatUnits,
  getAddress,
  parseEther,
} from 'ethers/lib/utils'
import { useBasketHandlerContract, useFacadeContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { balancesAtom } from 'state/atoms'
import {
  loadTransactions,
  TransactionState,
  TX_STATUS,
  useTransactionsState,
} from 'state/context/TransactionManager'
import { ReserveToken } from 'types'
import { formatCurrency } from 'utils'
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
  quantities: { [x: string]: BigNumber }
): TransactionState[] => {
  const tokenQuantities: [string, BigNumber][] = []

  // Create token approvals calls array
  const transactions: TransactionState[] = data.basket.collaterals.map(
    ({ token, index }) => {
      const description = `Approve ${token.symbol} for issuance`
      const tokenAmount = quantities[getAddress(token.address)]

      // Fill token quantities on the same map
      tokenQuantities.push([token.address, tokenAmount])

      return {
        autoCall: false,
        description,
        status: TX_STATUS.PENDING,
        value: formatUnits(tokenAmount, token.decimals),
        call: {
          abi: ERC20Interface,
          address: token.address,
          method: 'approve',
          args: [data.isRSV ? data.id : data.token.address, tokenAmount],
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
      abi: data.isRSV ? RSVManagerInterface : RTokenInterface,
      address: data.isRSV ? data.id : data.token.address,
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
  // TODO: Fix balances
  const balance = 0
  const tokenBalances = useAtomValue(balancesAtom)
  const { account } = useEthers()
  // TODO: replace for facade
  const facadeContract = useFacadeContract(data.facade ?? '')

  const setMaxIssuable = async (
    address: string,
    mounted: { value: boolean }
  ) => {
    try {
      const maxIssuable = await facadeContract!.callStatic.maxIssuable(address)
      if (mounted.value) {
        setAmount(maxIssuable ? Number(formatEther(maxIssuable)) : 0)
      }
    } catch (e) {
      console.log('error with max issuable', e)
    }
  }

  useEffect(() => {
    const mounted = { value: true }

    if (data.isRSV) {
      setAmount(getIssuable(data, tokenBalances))
    } else if (account && facadeContract) {
      setMaxIssuable(account, mounted)
    } else {
      setAmount(0)
    }

    return () => {
      mounted.value = false
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
  const basketHandler = useBasketHandlerContract(data.basketHandler)
  const [, dispatch] = useTransactionsState()
  const issuableAmount = useTokenIssuableAmount(data)

  const handleIssue = async () => {
    setIssuing(true)
    try {
      const issueAmount = parseEther(amount)
      let quantities: { [x: string]: BigNumber } = {}

      // RSV have hardcoded quantities
      if (data.isRSV) {
        quantities = quote(issueAmount)
      } else if (basketHandler) {
        const quoteResult = await basketHandler.quote(issueAmount, 2)
        quantities = quoteResult.erc20s.reduce(
          (prev, current, currentIndex) => {
            prev[getAddress(current)] = quoteResult.quantities[currentIndex]
            return prev
          },
          {} as any
        )
      }

      if (!Object.keys(quantities).length) {
        throw new Error('Unable to fetch quantities')
      }

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
          Max: {formatCurrency(issuableAmount)}
        </Text>
        <Button disabled={!isValid() || issuing} mt={2} onClick={handleIssue}>
          + Mint {data.token.symbol}
        </Button>
      </InputContainer>
    </Card>
  )
}

export default Issue
