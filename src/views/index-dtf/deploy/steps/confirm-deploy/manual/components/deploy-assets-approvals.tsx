import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { formatCurrency, shortenAddress } from '@/utils'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { basketAtom } from '@/views/index-dtf/deploy/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { CheckCircle2, Wallet } from 'lucide-react'
import { Address, erc20Abi, formatUnits, parseUnits } from 'viem'
import { useReadContract, useWriteContract } from 'wagmi'
import {
  basketRequiredAmountsAtom,
  formattedAssetsAllowanceAtom,
  hasBalanceAtom,
} from '../atoms'
import { useEffect } from 'react'

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
  const setHasBalance = useSetAtom(hasBalanceAtom)
  const { data } = useReadContract({
    abi: erc20Abi,
    address,
    functionName: 'balanceOf',
    args: [wallet ?? '0x'],
    query: { enabled: !!wallet },
  })

  const balance = Number(formatUnits(data ?? 0n, decimals))

  useEffect(() => {
    setHasBalance(balance >= required)
  }, [balance, required])

  console.log('decimals', { required, balance })

  return (
    <div className="flex flex-col text-sm mr-2 ">
      <div className="flex gap-1 justify-end items-center">
        <Wallet size={16} />
        <span className="font-semibold">
          {formatCurrency(balance, 1, {
            notation: 'compact',
            compactDisplay: 'short',
          })}
        </span>
      </div>
      <div>
        <span className="text-legend">Required:</span>{' '}
        <span
          className={cn(
            'font-semibold',
            balance >= required ? 'text-success' : 'text-destructive'
          )}
        >
          {formatCurrency(required, 9, {
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
  const chainId = useAtomValue(chainIdAtom)
  const assetsAllowance = useAtomValue(formattedAssetsAllowanceAtom)

  const approve = () => {
    writeContract({
      abi: erc20Abi,
      address,
      functionName: 'approve',
      args: [
        INDEX_DEPLOYER_ADDRESS[chainId],
        parseUnits((amount * 2).toString(), decimals),
      ],
    })
  }

  if (
    isSuccess ||
    (assetsAllowance[address] && amount && assetsAllowance[address] >= amount)
  ) {
    return <CheckCircle2 className="mx-2" color="green" size={24} />
  }

  return (
    <Button
      variant="outline-primary"
      className="rounded-full"
      onClick={approve}
      disabled={isPending || !amount}
    >
      {isPending ? 'Approving...' : 'Approve'}
    </Button>
  )
}

const DeployAssetsApproval = () => {
  const basket = useAtomValue(basketAtom)
  const basketAmountMap = useAtomValue(basketRequiredAmountsAtom)

  return (
    <div className="flex flex-col mt-2 gap-2">
      <h4 className="font-bold my-2 ml-2">Required approvals</h4>

      {basket.map((token, index) => (
        <div
          className={cn('flex items-center flex-wrap gap-2 px-2 border-t pt-2')}
          key={token.address}
        >
          <TokenLogo symbol={token.symbol} src={token.logoURI} size="xl" />
          <div className="flex flex-col mr-auto">
            <div className="text-base font-bold">{token.name}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{token.symbol}</span>
              <span>•</span>
              <span>{shortenAddress(token.address)}</span>
            </div>
          </div>
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
      ))}
    </div>
  )
}

export default DeployAssetsApproval
