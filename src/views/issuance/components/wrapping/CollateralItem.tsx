import { t } from '@lingui/macro'
import ConvexWrapper from 'abis/ConvexWrapper'
import ERC20 from 'abis/ERC20'
import MorphoWrapper from 'abis/MorphoWrapper'
import StaticAave from 'abis/StaticAave'
import sDai from 'abis/sDai'
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
import { Address, useBalance, useContractReads } from 'wagmi'

export enum WrapCollateralType {
  AaveV2,
  Convex,
  Curve,
  Morpho,
  DaiSavingsRate,
}

interface Props extends BoxProps {
  collateral: CollateralPlugin
  wrapping: boolean
  type: WrapCollateralType
}

const ABI = {
  [WrapCollateralType.AaveV2]: StaticAave,
  [WrapCollateralType.Convex]: ConvexWrapper,
  [WrapCollateralType.Morpho]: MorphoWrapper,
}

// {
//   contracts: allowances.map((allowance) => ({
//     abi: ERC20,
//     functionName: 'allowance',
//     address: allowance.token,
//     args: [account, allowance.spender],
//   })),
//   watch: true,
//   allowFailure: false,
// }

const CollateralItem = ({ collateral, wrapping, type, ...props }: Props) => {
  const wallet = useAtomValue(walletAtom)
  const fromToken = wrapping ? collateral.referenceUnit : collateral.symbol
  const toToken = wrapping ? collateral.symbol : collateral.referenceUnit
  const [amount, setAmount] = useState('')

  // const { data: testData } = useContractReads({
  //   contracts: [
  //     {
  //       abi: ABI[type],
  //       functionName: 'asset',
  //       address: collateral.address as Address,
  //     },
  //   ],
  //   allowFailure: false,
  // })

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
      address: (collateral.underlyingToken ||
        collateral.collateralAddress) as Address,
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
    if (type === WrapCollateralType.AaveV2) {
      // Aave v2
      return {
        abi: StaticAave,
        address: collateral.depositContract as Address,
        functionName: wrapping ? 'deposit' : 'withdraw',
        args: wrapping
          ? [wallet, parsedAmount, 0, 1]
          : [wallet, parsedAmount, true], // change 1 to 0 when going from aToken
      }
    } else if (type === WrapCollateralType.Convex) {
      // Convex
      return {
        abi: ConvexWrapper,
        address: collateral.depositContract as Address,
        functionName: wrapping ? 'stake' : 'withdraw',
        args: wrapping ? [parsedAmount, wallet] : [parsedAmount],
      }
    } else if (type === WrapCollateralType.Curve) {
      // Convex
      return {
        abi: ConvexWrapper,
        address: collateral.depositContract as Address,
        functionName: wrapping ? 'stake' : 'withdraw',
        args: wrapping ? [parsedAmount, wallet] : [parsedAmount],
      }
    } else if (type === WrapCollateralType.Morpho) {
      // Morpho Aave
      return {
        abi: MorphoWrapper,
        address: collateral.depositContract as Address,
        functionName: wrapping ? 'deposit' : 'withdraw',
        args: wrapping
          ? [parsedAmount, wallet]
          : [parsedAmount, wallet, wallet],
      }
    } else if (type === WrapCollateralType.DaiSavingsRate) {
      // DSR (sDAI)
      return {
        abi: sDai,
        address: collateral.depositContract as Address,
        functionName: wrapping ? 'deposit' : 'redeem',
        args: wrapping
          ? [parsedAmount, wallet]
          : [parsedAmount, wallet, wallet],
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
                width: [160, 160],
                fontSize: 1,
              }}
              placeholder={t`${fromToken} amount`}
              value={amount}
              onChange={setAmount}
              // disabled={signing} // TODO: Disable when tx is in progress
              variant={debouncedAmount && !isValid ? 'inputError' : 'input'}
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
