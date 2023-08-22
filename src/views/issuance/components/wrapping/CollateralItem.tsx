import { t } from '@lingui/macro'
import ConvexWrapper from 'abis/ConvexWrapper'
import ERC20 from 'abis/ERC20'
import StaticAave from 'abis/StaticAave'
import { NumericalInput } from 'components'
import { ExecuteButton } from 'components/button/TransactionButton'
import TokenLogo from 'components/icons/TokenLogo'
import useDebounce from 'hooks/useDebounce'
import useHasAllowance from 'hooks/useHasAllowance'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { walletAtom } from 'state/atoms'
import { Box, BoxProps, Text } from 'theme-ui'
import { CollateralPlugin } from 'types'
import { formatCurrency, safeParseEther } from 'utils'
import { Address, useBalance } from 'wagmi'

export enum WrapCollateralType {
  Aave,
  Convex,
}

const ABIS = {
  [WrapCollateralType.Aave]: StaticAave,
  [WrapCollateralType.Convex]: ConvexWrapper,
}

interface Props extends BoxProps {
  collateral: CollateralPlugin
  wrapping: boolean
  type: WrapCollateralType
}

const CollateralItem = ({ collateral, wrapping, type, ...props }: Props) => {
  const wallet = useAtomValue(walletAtom)

  const [fromUnderlying, setFromUnderlying] = useState(true) // true = USDC -> saUSDC
  const fromToken = wrapping ? collateral.referenceUnit : collateral.symbol
  const toToken = wrapping ? collateral.symbol : collateral.referenceUnit
  const [amount, setAmount] = useState('')

  const { data } = useBalance({
    address: wallet ? wallet : undefined,
    token: (wrapping
      ? collateral.underlyingToken
      : collateral.depositContract) as Address,
    watch: true,
  })
  const debouncedAmount = useDebounce(amount, 500)

  const isValid =
    data &&
    Number(debouncedAmount) > 0 &&
    safeParseEther(debouncedAmount, data.decimals) <= data.value

  const [hasAllowance] = useHasAllowance(
    wrapping && isValid
      ? [
          {
            token: collateral.underlyingToken as Address,
            spender: collateral.depositContract as Address,
            amount: safeParseEther(debouncedAmount, data.decimals),
          },
        ]
      : undefined
  )

  const approveCall = useMemo(() => {
    if (!isValid || !wrapping || !wallet) {
      return undefined
    }

    return {
      abi: ERC20,
      address: collateral.underlyingToken as Address,
      functionName: 'approve',
      args: [
        collateral.depositContract as Address,
        safeParseEther(debouncedAmount, data.decimals),
      ],
    }
  }, [isValid, wrapping, debouncedAmount])

  const executeCall = useMemo(() => {
    if (!isValid || !hasAllowance || !wallet) {
      return undefined
    }

    const parsedAmount = safeParseEther(debouncedAmount, data.decimals)

    // Change to swithc if types are more than 3
    if (type === WrapCollateralType.Aave) {
      return {
        abi: StaticAave,
        address: collateral.depositContract as Address,
        functionName: wrapping ? 'deposit' : 'withdraw',
        args: wrapping
          ? [wallet, parsedAmount, 0, 1]
          : [wallet, parsedAmount, true], // change 1 to 0 when going from aToken
      }
    } else {
      // Convex
      return {
        abi: ConvexWrapper,
        address: collateral.depositContract as Address,
        functionName: wrapping ? 'stake' : 'withdraw',
        args: wrapping ? [parsedAmount, wallet] : [parsedAmount],
      }
    }
  }, [isValid, wrapping, hasAllowance, debouncedAmount])

  useEffect(() => {
    if (amount) {
      setAmount('')
    }
  }, [wrapping])

  const handleSuccess = () => {
    setAmount('')
  }

  return (
    <Box {...props}>
      <Box variant="layout.verticalAlign">
        <TokenLogo symbol={collateral.symbol} width={20} mr={3} />
        <Box sx={{ flexGrow: 1 }}>
          <Box variant="layout.verticalAlign">
            <Box sx={{ maxWidth: 200 }}>
              <Text as="label">
                {fromToken} to {toToken}
              </Text>
              <Text
                onClick={() => setAmount(data?.formatted ?? '')}
                as="a"
                variant="a"
                sx={{ display: 'block', fontSize: 1 }}
                ml={'auto'}
                mt={1}
                mr={2}
              >
                Max:{' '}
                {data
                  ? formatCurrency(Number(data.formatted), 5)
                  : 'Fetching...'}
              </Text>
            </Box>

            <NumericalInput
              ml="auto"
              mr={3}
              sx={{
                padding: '6px',
                paddingLeft: '6px',
                width: [140, 200],
                fontSize: 1,
              }}
              placeholder={t`Input ${fromToken} amount`}
              value={amount}
              onChange={setAmount}
              // disabled={signing} // TODO: Disable when tx is in progress
              variant={amount && !isValid ? 'inputError' : 'input'}
            />
            {!hasAllowance && (
              <ExecuteButton
                sx={{ flexShrink: 0 }}
                call={approveCall}
                text="Approve"
                small
              />
            )}
            {hasAllowance && (
              <ExecuteButton
                call={executeCall}
                sx={{ flexShrink: 0 }}
                disabled={!isValid}
                text={wrapping ? 'Wrap' : 'Unwrap'}
                small
                onSuccess={handleSuccess}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CollateralItem
