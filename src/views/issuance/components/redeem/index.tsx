import { parseEther } from '@ethersproject/units'
import { ERC20Interface, RSVManagerInterface, RTokenInterface } from 'abis'
import { Button, Card } from 'components'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { ReserveToken, TransactionState } from 'types'
import { TRANSACTION_STATUS } from 'utils/constants'
import { v4 as uuid } from 'uuid'
import { isValidRedeemAmountAtom } from 'views/issuance/atoms'
import RedeemInput from './RedeemInput'

const buildTransactions = (
  data: ReserveToken,
  amount: string
): TransactionState[] => {
  const parsedAmount = parseEther(amount)

  // TODO: Confirm modal for redemption
  if (data.isRSV) {
    return [
      {
        id: uuid(),
        description: 'Approve RSV for redemption',
        status: TRANSACTION_STATUS.PENDING,
        value: amount,
        call: {
          abi: ERC20Interface,
          address: data.token.address,
          method: 'approve',
          args: [data.id, parsedAmount],
        },
      },
      {
        id: uuid(),
        description: `Redeem ${amount} ${data.token.symbol}`,
        status: TRANSACTION_STATUS.PENDING,
        value: amount,
        requiredAllowance: [[data.token.address, parsedAmount]],
        call: {
          abi: RSVManagerInterface,
          address: data.id,
          method: 'redeem',
          args: [parsedAmount],
        },
      },
    ]
  }

  return [
    {
      id: uuid(),
      description: `Redeem ${amount} ${data.token.symbol}`,
      status: TRANSACTION_STATUS.PENDING,
      value: amount,
      call: {
        abi: RTokenInterface,
        address: data.token.address,
        method: 'redeem',
        args: [parsedAmount],
      },
    },
  ]
}

const Redeem = ({
  max,
  data,
  ...props
}: {
  max: number
  data: ReserveToken
}) => {
  const [confirming, setConfirming] = useState(false)
  const isValid = useAtomValue(isValidRedeemAmountAtom)

  return (
    <Card p={4} {...props}>
      <RedeemInput />
      <Button
        disabled={!isValid}
        sx={{ width: '100%' }}
        mt={2}
        onClick={() => setConfirming(true)}
      >
        - Redeem {data.token.symbol}
      </Button>
    </Card>
  )
}

export default Redeem
