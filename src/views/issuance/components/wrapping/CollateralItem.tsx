import { t } from '@lingui/macro'
import CollateralWrap from 'abis/CollateralWrap'
import ERC20 from 'abis/ERC20'
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
import { BIGINT_MAX } from 'utils/constants'
import { Address, useBalance } from 'wagmi'

interface Props extends BoxProps {
  collateral: CollateralPlugin
  wrapping: boolean
}

const CollateralItem = ({ collateral, wrapping, ...props }: Props) => {
  const wallet = useAtomValue(walletAtom)
  const fromToken = wrapping ? collateral.underlyingToken : collateral.symbol
  const toToken = wrapping ? collateral.symbol : collateral.underlyingToken
  const [amount, setAmount] = useState('')

  const { data } = useBalance({
    address: wallet ? wallet : undefined,
    token: (wrapping
      ? collateral.underlyingAddress
      : collateral.erc20) as Address,
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
            token: collateral.underlyingAddress as Address,
            spender: collateral.erc20,
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
      address: collateral.underlyingAddress as Address,
      functionName: 'approve',
      args: [
        collateral.erc20,
        collateral.protocol === 'COMPv3'
          ? BIGINT_MAX
          : safeParseEther(debouncedAmount, data.decimals),
      ],
    }
  }, [isValid, wrapping, debouncedAmount])

  const executeCall = useMemo(() => {
    if (!isValid || !hasAllowance || !wallet) {
      return undefined
    }

    const COMPv2ABI = [
      {
        inputs: [
          { internalType: 'uint256', name: '_amount', type: 'uint256' },
          { internalType: 'address', name: '_to', type: 'address' },
        ],
        name: 'deposit',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'uint256', name: '_amount', type: 'uint256' },
          { internalType: 'address', name: '_to', type: 'address' },
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as any
    const parsedAmount = safeParseEther(debouncedAmount, data.decimals)
    const call = { abi: CollateralWrap, address: collateral.erc20 }

    switch (collateral.protocol) {
      case 'AAVE':
        return {
          ...call,
          functionName: wrapping ? 'deposit' : 'withdraw',
          args: wrapping
            ? [wallet, parsedAmount, 0, 1]
            : [wallet, parsedAmount, true], // change 1 to 0 when going from aToken
        }
      case 'AAVEv3':
        return {
          ...call,
          functionName: wrapping ? 'deposit' : 'redeem',
          args: wrapping
            ? [parsedAmount, wallet, 0, true]
            : [parsedAmount, wallet, wallet, true], // change 1 to 0 when going from aToken
        }
      case 'CURVE':
        return {
          ...call,
          abi: COMPv2ABI,
          functionName: wrapping ? 'deposit' : 'withdraw',
          args: [parsedAmount, wallet],
        }
      case 'CONVEX':
        return {
          ...call,
          functionName: wrapping ? 'stake' : 'withdraw',
          args: wrapping ? [parsedAmount, wallet] : [parsedAmount],
        }
      case 'MORPHO':
      case 'SDR':
        return {
          ...call,
          functionName: wrapping ? 'deposit' : 'redeem',
          args: wrapping
            ? [parsedAmount, wallet]
            : [parsedAmount, wallet, wallet],
        }
      case 'FLUX':
        return {
          ...call,
          abi: COMPv2ABI,
          functionName: wrapping ? 'deposit' : 'withdraw',
          args: [parsedAmount, wallet],
        }
      case 'COMP':
        return {
          ...call,
          abi: COMPv2ABI,
          functionName: wrapping ? 'deposit' : 'withdraw',
          args: [parsedAmount, wallet],
        }
      case 'COMPv3':
        return {
          ...call,
          functionName: wrapping ? 'deposit' : 'withdraw',
          args: [parsedAmount],
        }
      case 'STARGATE':
        return {
          ...call,
          abi: COMPv2ABI,
          functionName: wrapping ? 'deposit' : 'withdraw',
          args: [parsedAmount],
        }
      default:
        return undefined
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
        <Box sx={{ flexGrow: 1 }} variant="layout.verticalAlign">
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
              {data ? formatCurrency(Number(data.formatted), 5) : 'Fetching...'}
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
  )
}

export default CollateralItem
