import { Address, parseUnits } from 'viem'
import { useZap } from '../context/ZapContext'
import { useApproval } from '../hooks/useApproval'
import ZapApprovalButton from './ZapApprovalButton'
import ZapConfirmButton from './ZapConfirmButton'
import { useMemo } from 'react'
import { Allowance } from 'types'

const ZapConfirm = () => {
  const { chainId, account, tokenIn, spender, amountIn } = useZap()

  const allowance: Allowance | undefined = useMemo(() => {
    if (!tokenIn.address || !spender) return undefined
    return {
      token: tokenIn.address.toString() as Address,
      spender: spender as Address,
      amount: parseUnits(amountIn, tokenIn.decimals),
      symbol: tokenIn.symbol,
      decimals: tokenIn.decimals,
    }
  }, [])

  const {
    validatingAllowance,
    hasAllowance,
    error,
    isLoading,
    isSuccess,
    approve,
  } = useApproval(chainId, account, allowance)

  if (!hasAllowance)
    return <ZapApprovalButton approve={approve} isLoading={isLoading} />
  return <ZapConfirmButton />
}

export default ZapConfirm
