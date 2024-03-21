import { useEffect, useMemo, useState } from 'react'
import { Box } from 'theme-ui'
import { Allowance } from 'types'
import { Address, parseUnits } from 'viem'
import ZapError from '../ZapError'
import { ZapErrorType, useZap } from '../context/ZapContext'
import { useApproval } from '../hooks/useApproval'
import ZapApprovalButton from './ZapApprovalButton'
import ZapConfirmButton from './ZapConfirmButton'

const ZapConfirm = () => {
  const [error, setError] = useState<ZapErrorType>()
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
  }, [tokenIn, spender, amountIn])

  const {
    hasAllowance,
    error: allowanceError,
    isLoading,
    validatingApproval,
    approve,
    isSuccess,
  } = useApproval(chainId, account, allowance)

  useEffect(() => {
    if (allowanceError) {
      setError({
        title: 'Transaction rejected',
        message: 'Please try again',
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
      })
    } else {
      setError(undefined)
    }
  }, [allowanceError])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {error && <ZapError error={error} />}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {allowance?.symbol !== 'ETH' && (
          <ZapApprovalButton
            hasAllowance={hasAllowance}
            approve={approve}
            isLoading={isLoading}
            validatingApproval={validatingApproval}
            isSuccess={isSuccess}
            error={error}
          />
        )}
        <ZapConfirmButton
          hasAllowance={hasAllowance}
          loadingApproval={isLoading}
          approvalSuccess={isSuccess}
          setError={setError}
        />
      </Box>
    </Box>
  )
}

export default ZapConfirm
