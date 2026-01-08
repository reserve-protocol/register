import USDT from '@/abis/USDT'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import Help from '@/components/ui/help'
import Spinner from '@/components/ui/spinner'
import useIsUSDT from '@/hooks/useIsUSDT'
import { cn } from '@/lib/utils'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { formatCurrency, shortenAddress } from '@/utils'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { BIGINT_MAX } from '@/utils/constants'
import { basketAtom } from '@/views/index-dtf/deploy/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { CheckCircle2, TextCursorInput, Wallet } from 'lucide-react'
import { useEffect } from 'react'
import { Address, erc20Abi, formatUnits, parseUnits } from 'viem'
import { useReadContract, useWriteContract } from 'wagmi'
import {
  basketRequiredAmountsAtom,
  deployBatchApprovalStateAtom,
  formattedAssetsAllowanceAtom,
  hasBalanceAtom,
  tokensNeedingApprovalForDeployAtom,
} from '../atoms'
import ApproveAllDeployButton from './approve-all-deploy-button'

const TokenBalance = ({
  address,
  decimals,
  required,
}: {
  address: Address
  decimals: number
  required: number
}) => {
  const wallet = useAtomValue(walletAtom)
  const chainId = useAtomValue(chainIdAtom)
  const setHasBalance = useSetAtom(hasBalanceAtom)
  const { data } = useReadContract({
    abi: erc20Abi,
    address,
    functionName: 'balanceOf',
    args: [wallet ?? '0x'],
    chainId,
    query: { enabled: !!wallet },
  })

  const balance = Number(formatUnits(data ?? 0n, decimals))

  useEffect(() => {
    setHasBalance(balance >= required)
  }, [balance, required])

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <Wallet size={16} />
        <span className="font-semibold">
          {formatCurrency(balance, 1, {
            notation: 'compact',
            compactDisplay: 'short',
          })}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <TextCursorInput size={16} />
        <span className="font-semibold">Required:</span>{' '}
        <span
          className={cn(
            'font-semibold',
            balance >= required ? 'text-success' : 'text-destructive',
            required === 0 && 'text-inherit'
          )}
        >
          {formatCurrency(required, 2, {
            notation: 'compact',
            compactDisplay: 'short',
          })}
        </span>
      </div>
    </div>
  )
}

const ApproveAsset = ({
  address,
  decimals,
  amount,
}: {
  address: Address
  decimals: number
  amount: number
}) => {
  const { writeContract, isPending, isSuccess } = useWriteContract()
  const {
    writeContract: writeContractRevoke,
    isPending: isPendingRevoke,
    isSuccess: isSuccessRevoke,
  } = useWriteContract()
  const chainId = useAtomValue(chainIdAtom)
  const assetsAllowance = useAtomValue(formattedAssetsAllowanceAtom)
  const batchState = useAtomValue(deployBatchApprovalStateAtom)

  const { isUSDT, needsRevoke } = useIsUSDT(
    address,
    chainId,
    INDEX_DEPLOYER_ADDRESS[chainId]
  )

  // Get batch approval state for this token
  const tokenBatchState = batchState[address.toLowerCase()]

  const revoke = () => {
    writeContractRevoke({
      abi: USDT,
      address,
      functionName: 'approve',
      args: [INDEX_DEPLOYER_ADDRESS[chainId], 0n],
      chainId,
    })
  }

  const approve = () => {
    writeContract({
      abi: isUSDT ? USDT : erc20Abi,
      address,
      functionName: 'approve',
      args: [
        INDEX_DEPLOYER_ADDRESS[chainId],
        isUSDT ? BIGINT_MAX : parseUnits((amount * 2).toString(), decimals),
      ],
      chainId,
    })
  }

  // Check if already approved (on-chain allowance or individual success)
  if (
    isSuccess ||
    (assetsAllowance[address] && amount && assetsAllowance[address] >= amount)
  ) {
    return <CheckCircle2 className="mx-2" color="green" size={24} />
  }

  // Show batch approval state if active
  if (tokenBatchState) {
    switch (tokenBatchState.status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Spinner size={16} />
            <span>Signing...</span>
          </div>
        )
      case 'confirming':
        return (
          <div className="flex items-center gap-2 text-primary text-sm">
            <Spinner size={16} />
            <span>Confirming...</span>
          </div>
        )
      case 'success':
        return <CheckCircle2 className="mx-2" color="green" size={24} />
      case 'error':
        // Show individual approve button as fallback for failed batch
        break
    }
  }

  if (needsRevoke && !isSuccessRevoke) {
    return (
      <Button
        variant="outline-primary"
        className="rounded-full"
        onClick={revoke}
        size="xs"
        disabled={isPendingRevoke}
      >
        <div className="flex items-center gap-1">
          {isPendingRevoke ? 'Revoking...' : 'Revoke'}
          <Help
            side="bottom"
            content={
              <span className="text-sm text-wrap font-light">
                This is a USDT token or a fork of USDT. You need to revoke the
                approval before you can approve it.
              </span>
            }
          />
        </div>
      </Button>
    )
  }

  return (
    <Button
      variant="outline-primary"
      className="rounded-full "
      onClick={approve}
      size="xs"
      disabled={isPending || !amount}
    >
      {isPending ? 'Approving...' : 'Approve'}
    </Button>
  )
}

const DeployAssetsApproval = () => {
  const basket = useAtomValue(basketAtom)
  const basketAmountMap = useAtomValue(basketRequiredAmountsAtom)
  const tokensNeedingApproval = useAtomValue(tokensNeedingApprovalForDeployAtom)

  return (
    <div className="flex flex-col mt-2 gap-2">
      <div className="flex items-center justify-between my-2 ml-2">
        <h4 className="font-bold">Required approvals</h4>
      </div>

      {tokensNeedingApproval.length > 1 && <ApproveAllDeployButton />}

      {basket.map((token) => (
        <div
          className={cn('flex flex-col gap-2 px-2 border-t pt-2')}
          key={token.address}
        >
          <div className="flex items-center flex-wrap gap-2">
            <TokenLogo symbol={token.symbol} src={token.logoURI} size="xl" />
            <div className="flex flex-col mr-auto">
              <div className="text-base font-bold">{token.name}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{token.symbol}</span>
                <span>•</span>
                <span>{shortenAddress(token.address)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 min-h-[32px]">
            <TokenBalance
              required={basketAmountMap[token.address]}
              address={token.address}
              decimals={token.decimals}
            />
            <ApproveAsset
              address={token.address}
              decimals={token.decimals}
              amount={basketAmountMap[token.address]}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default DeployAssetsApproval
