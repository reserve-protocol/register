import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { formatCurrency, shortenAddress } from '@/utils'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { basketAtom } from '@/views/index-dtf/deploy/atoms'
import { useAtomValue } from 'jotai'
import { CheckCircle2 } from 'lucide-react'
import { Address, erc20Abi, formatUnits, parseUnits } from 'viem'
import { useReadContract, useWriteContract } from 'wagmi'
import {
  basketRequiredAmountsAtom,
  formattedAssetsAllowanceAtom,
} from '../atoms'

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
  const { data } = useReadContract({
    abi: erc20Abi,
    address,
    functionName: 'balanceOf',
    args: [wallet ?? '0x'],
    query: { enabled: !!wallet },
  })

  const balance = Number(formatUnits(data ?? 0n, decimals))

  return (
    <span
      className="font-semibold"
      style={{
        color: required ? (balance >= required ? 'green' : 'red') : 'inherit',
      }}
    >
      {formatCurrency(balance, 3)}
    </span>
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
        parseUnits(amount.toString(), decimals),
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
      {basket.map((token) => (
        <div className="flex items-center gap-2 px-2" key={token.address}>
          <TokenLogo symbol={token.symbol} src={token.logoURI} size="xl" />
          <div className="flex flex-col mr-auto">
            <div className="text-base font-bold">{token.name}</div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span className="text-primary">{token.symbol}</span>
              <span>•</span>
              <span>{shortenAddress(token.address)}</span>
            </div>
          </div>
          <div className="flex flex-col text-sm mr-2 ">
            <div>
              <span className="text-legend">Balance:</span>{' '}
              <TokenBalance
                required={basketAmountMap[token.address] * 1.1} // 10% buffer
                address={token.address}
                decimals={token.decimals}
              />
            </div>
            <div>
              <span className="text-legend">Required:</span>{' '}
              <span className="font-semibold">
                {formatCurrency(basketAmountMap[token.address], 3)}
              </span>
            </div>
          </div>
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
