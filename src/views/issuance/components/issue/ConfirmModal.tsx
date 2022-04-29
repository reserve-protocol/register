import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseEther } from '@ethersproject/units'
import { ERC20Interface, RSVManagerInterface, RTokenInterface } from 'abis'
import Modal, { ModalProps } from 'components/modal'
import { useBasketHandlerContract } from 'hooks/useContract'
import useMountedState from 'hooks/useMountedState'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { addTransactionAtom, allowanceAtom } from 'state/atoms'
import { ReserveToken, TransactionState } from 'types'
import { hasAllowance } from 'utils'
import { TRANSACTION_STATUS } from 'utils/constants'
import { quote } from 'utils/rsv'

interface Props {
  data: ReserveToken
  amount: string
  onClose: () => void
}

interface IQuantities {
  [x: string]: BigNumber
}

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
  quantities: IQuantities,
  allowances: IQuantities
): TransactionState[] => {
  const tokenQuantities: [string, BigNumber][] = []

  // Create token approvals calls array
  const transactions: TransactionState[] = data.basket.collaterals.map(
    ({ token }) => {
      const description = `Approve ${token.symbol} for issuance`
      const tokenAmount = quantities[getAddress(token.address)]

      // Fill token quantities on the same map
      tokenQuantities.push([token.address, tokenAmount])

      return {
        description,
        status: allowances[getAddress(token.address)].gte(tokenAmount)
          ? TRANSACTION_STATUS.SKIPPED
          : TRANSACTION_STATUS.PENDING,
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
    description: `Issue ${amount} ${data.token.symbol}`,
    status: hasAllowance(allowances, tokenQuantities)
      ? TRANSACTION_STATUS.PENDING
      : TRANSACTION_STATUS.PENDING_ALLOWANCE,
    value: amount,
    requiredAllowance: tokenQuantities, // Send quantities as an extra prop for allowance check before issuance
    call: {
      abi: data.isRSV ? RSVManagerInterface : RTokenInterface,
      address: data.isRSV ? data.id : data.token.address,
      method: 'issue',
      args: [parseEther(amount)],
    },
  })

  return transactions
}

const ConfirmModal = ({ data, amount, onClose }: Props) => {
  const addTransaction = useSetAtom(addTransactionAtom)
  const allowances = useAtomValue(allowanceAtom)
  const basketHandler = useBasketHandlerContract(data.basketHandler)
  const [txs, setTxs] = useState([] as TransactionState[])
  const isMounted = useMountedState()

  const fetchQuantities = useCallback(async () => {
    try {
      const issueAmount = parseEther(amount)
      let quantities: IQuantities = {}

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

      if (isMounted()) {
        setTxs(buildTransactions(data, amount, quantities, allowances))
      }
    } catch (e) {
      // TODO: Handle error case
      console.error('failed fetching quantities', e)
    }
  }, [])

  useEffect(() => {
    fetchQuantities()
  }, [])

  // approvals gas
  useEffect(() => {}, [])

  const handleIssue = () => {
    addTransaction(txs)
  }

  return (
    <Modal title="Confirm Issuance" onClose={onClose}>
      modal
    </Modal>
  )
}

export default ConfirmModal
