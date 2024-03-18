import { Address, parseUnits } from 'viem'
import { useZap } from '../context/ZapContext'
import { useApproval } from '../hooks/useApproval'
import ZapApprovalButton from './ZapApprovalButton'
import ZapConfirmButton from './ZapConfirmButton'
import { useMemo } from 'react'
import { Allowance } from 'types'

const ZapConfirm = () => {
  const { selectedToken, spender, amountIn } = useZap()

  const allowance: Allowance | undefined = useMemo(() => {
    if (!selectedToken || !spender) return undefined
    return {
      token: selectedToken.address.toString() as Address,
      spender: spender as Address,
      amount: parseUnits(amountIn, selectedToken?.decimals),
      symbol: selectedToken?.symbol,
      decimals: selectedToken?.decimals,
    }
  }, [])

  const {
    validatingAllowance,
    hasAllowance,
    error,
    isLoading,
    isSuccess,
    approve,
  } = useApproval(allowance)

  if (!hasAllowance)
    return <ZapApprovalButton approve={approve} isLoading={isLoading} />
  return <ZapConfirmButton />
}

export default ZapConfirm
