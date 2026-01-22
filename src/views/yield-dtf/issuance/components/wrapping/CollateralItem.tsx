import { t } from '@lingui/macro'
import CollateralWrap from 'abis/CollateralWrap'
import ERC20 from 'abis/ERC20'
import USDT from 'abis/USDT'
import { NumericalInput } from 'components'
import { ExecuteButton } from '@/components/ui/transaction-button'
import TokenLogo from 'components/icons/TokenLogo'
import useDebounce from 'hooks/useDebounce'
import useHasAllowance from 'hooks/useHasAllowance'
import { useShouldRefresh } from 'hooks/useWatchReadContract'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { chainIdAtom, walletAtom } from 'state/atoms'
import { CollateralPlugin } from 'types'
import { formatCurrency, safeParseEther } from 'utils'
import { ChainId } from 'utils/chains'
import { BIGINT_MAX } from 'utils/constants'
import { Address } from 'viem'
import { useBalance, useReadContract } from 'wagmi'
import { cn } from '@/lib/utils'

interface Props {
  collateral: CollateralPlugin
  wrapping: boolean
  className?: string
}

const CollateralItem = ({ collateral, wrapping, className }: Props) => {
  const wallet = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const fromToken = wrapping ? collateral.underlyingToken : collateral.symbol
  const toToken = wrapping ? collateral.symbol : collateral.underlyingToken
  const [amount, setAmount] = useState('')
  const shouldRefetch = useShouldRefresh(chainId)

  const { data, refetch } = useBalance({
    address: wallet ? wallet : undefined,
    token: (wrapping
      ? collateral.underlyingAddress
      : collateral.erc20) as Address,
    chainId,
  })

  useEffect(() => {
    if (shouldRefetch) {
      refetch()
    }
  }, [refetch, shouldRefetch])

  const debouncedAmount = useDebounce(amount, 500)

  const useAssets = useMemo(
    () =>
      !wrapping &&
      (collateral.symbol === 'wcUSDCv3' || collateral.symbol === 'wcUSDTv3'),
    [wrapping, collateral.symbol]
  )

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

    if (collateral.underlyingToken === 'USDT' && chainId === ChainId.Mainnet) {
      return {
        abi: USDT,
        address: collateral.underlyingAddress as Address,
        functionName: 'approve',
        args: [collateral.erc20, BIGINT_MAX],
      }
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

  const { data: parsedAssets } = useReadContract({
    abi: [
      {
        inputs: [
          {
            internalType: 'uint104',
            name: 'amount',
            type: 'uint104',
          },
        ],
        name: 'convertStaticToDynamic',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    address: collateral.erc20,
    functionName: 'convertStaticToDynamic',
    args: [safeParseEther(debouncedAmount, data?.decimals)],
    chainId,
    query: { enabled: isValid && useAssets },
  })

  const executeCall = useMemo(() => {
    if (!isValid || !hasAllowance || !wallet || (useAssets && !parsedAssets)) {
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
    const parsedAmount = useAssets
      ? parsedAssets
      : safeParseEther(debouncedAmount, data.decimals)
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
          abi: [
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
                {
                  internalType: 'uint256',
                  name: '_amount',
                  type: 'uint256',
                },
              ],
              name: 'withdrawAndUnwrap',
              outputs: [],
              stateMutability: 'nonpayable',
              type: 'function',
            },
          ],
          functionName: wrapping ? 'deposit' : 'withdrawAndUnwrap',
          args: wrapping ? [parsedAmount, wallet] : [parsedAmount],
        }
      case 'AERODROME':
        return {
          ...call,
          abi: [
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
          ],
          functionName: wrapping ? 'deposit' : 'withdraw',
          args: [parsedAmount, wallet],
        }
      case 'MORPHO':
      case 'SDR':
      case 'SKY':
      case 'ORIGIN':
      case 'USDM':
      case 'PXETH':
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
          args: [parsedAmount, wallet],
        }
      default:
        return undefined
    }
  }, [
    isValid,
    wrapping,
    hasAllowance,
    debouncedAmount,
    useAssets,
    parsedAssets,
  ])

  useEffect(() => {
    if (amount) {
      setAmount('')
    }
  }, [wrapping])

  const handleSuccess = () => {
    setAmount('')
  }

  return (
    <div className={className}>
      <div className="flex items-center">
        <TokenLogo symbol={collateral.symbol} width={20} className="mr-4" />
        <div className="flex-grow flex items-center">
          <div className="max-w-[200px]">
            <label>
              {fromToken} to {toToken}
            </label>
            <a
              onClick={() => setAmount(data?.formatted ?? '')}
              className="block text-xs mt-1 mr-2 ml-auto text-primary hover:underline cursor-pointer"
            >
              Max:{' '}
              {data ? formatCurrency(Number(data.formatted), 5) : 'Fetching...'}
            </a>
          </div>
          <div className="ml-auto mr-4 w-40">
            <NumericalInput
              className={cn(
                'p-1.5 text-sm w-full border rounded',
                debouncedAmount && !isValid ? 'border-destructive' : 'border-border'
              )}
              placeholder={t`${fromToken} amount`}
              value={amount}
              onChange={setAmount}
            />
          </div>
          {!hasAllowance && (
            <ExecuteButton
              className="shrink-0"
              call={approveCall}
              text="Approve"
              size="sm"
            />
          )}
          {hasAllowance && (
            <ExecuteButton
              call={executeCall}
              className="shrink-0"
              disabled={!isValid}
              text={wrapping ? 'Wrap' : 'Unwrap'}
              size="sm"
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CollateralItem
