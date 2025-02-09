import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { cutDecimals, formatCurrency, shortenAddress } from '@/utils'
import { useAtomValue } from 'jotai'
import { CheckCircle2, Wallet } from 'lucide-react'
import { Address, erc20Abi, formatUnits } from 'viem'
import { useWriteContract } from 'wagmi'
import {
  allowanceMapAtom,
  assetAmountsMapAtom,
  balanceMapAtom,
  modeAtom,
} from '../atoms'
import { cn } from '@/lib/utils'

const ApproveAsset = ({ address }: { address: Address }) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const { writeContract, isPending, isSuccess } = useWriteContract()
  const chainId = useAtomValue(chainIdAtom)
  const allowanceMap = useAtomValue(allowanceMapAtom)
  const assetAmountsMap = useAtomValue(assetAmountsMapAtom)
  const amount = assetAmountsMap[address] ?? 0n

  if (!amount) return null

  const approve = () => {
    if (!indexDTF || !assetAmountsMap[address]) return

    writeContract({
      abi: erc20Abi,
      address,
      functionName: 'approve',
      args: [indexDTF.id, assetAmountsMap[address] * 2n],
      chainId,
    })
  }

  if (
    isSuccess ||
    (allowanceMap[address] && amount && allowanceMap[address] >= amount)
  ) {
    return <CheckCircle2 className="mx-2" color="green" size={24} />
  }

  return (
    <Button
      variant="outline-primary"
      className="rounded-full"
      onClick={approve}
      size="xs"
      disabled={isPending || !amount}
    >
      {isPending ? 'Approving...' : 'Approve'}
    </Button>
  )
}

const RedeemAssetAmount = ({ token }: { token: Token }) => {
  const assetAmount = useAtomValue(assetAmountsMapAtom)
  const prices = useAtomValue(indexDTFBasketPricesAtom)

  const amount = Number(
    formatUnits(assetAmount[token.address] ?? 0n, token.decimals)
  )

  const usdAmount = amount * prices[token.address]

  return (
    <div className="flex flex-col items-end text-sm mt-auto">
      <div className="flex items center gap-1">
        <span className="font-semibold">${formatCurrency(usdAmount, 2)}</span>
      </div>
      <div className="flex items center gap-1">
        <span className="text-legend">Amount:</span>
        <span className="text-primary font-semibold">
          {formatCurrency(amount, 2)}
        </span>
      </div>
    </div>
  )
}

const AssetBalance = ({ token }: { token: Token }) => {
  const balance = useAtomValue(balanceMapAtom)[token.address] ?? 0n
  const required = useAtomValue(assetAmountsMapAtom)[token.address] ?? 0n
  const numericBalance = Number(formatUnits(balance, token.decimals))
  const numericRequired = Number(formatUnits(required, token.decimals))

  return (
    <div className="flex flex-col text-sm mr-2">
      <div className="flex gap-1 justify-end items-center">
        <Wallet size={16} />
        <span className="font-semibold">
          {formatCurrency(numericBalance, 1, {
            notation: 'compact',
            compactDisplay: 'short',
          })}
        </span>
      </div>
      {!!numericRequired && (
        <div>
          <span className="text-legend">Required:</span>{' '}
          <span
            className={cn(
              'font-semibold',
              balance >= required ? 'text-success' : 'text-destructive'
            )}
          >
            {cutDecimals(
              formatCurrency(numericRequired, 9, {
                notation: 'compact',
                compactDisplay: 'short',
              })
            )}
          </span>
        </div>
      )}
    </div>
  )
}

const MintAssetAmount = ({ token }: { token: Token }) => {
  return (
    <div className="flex items-center gap-2 ml-auto">
      <AssetBalance token={token} />
      <ApproveAsset address={token.address} />
    </div>
  )
}

const AssetAmount = ({ token }: { token: Token }) => {
  const mode = useAtomValue(modeAtom)

  if (mode === 'buy') {
    return <MintAssetAmount token={token} />
  }

  return <RedeemAssetAmount token={token} />
}
const AssetItem = ({ token }: { token: Token }) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex items-center flex-wrap gap-2 border-t p-2">
      <TokenLogo
        symbol={token.symbol}
        address={token.address}
        size="xl"
        chain={chainId}
      />
      <div className="flex flex-col mr-auto">
        <div className="text-base font-bold">{token.name}</div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{token.symbol}</span>
          <span>•</span>
          <span>{shortenAddress(token.address)}</span>
        </div>
      </div>
      <AssetAmount token={token} />
    </div>
  )
}

const AssetList = () => {
  const mode = useAtomValue(modeAtom)
  const basket = useAtomValue(indexDTFBasketAtom)

  return (
    <div className="rounded-3xl bg-card border">
      <div className="p-4 border-b">
        <h1 className="font-bold">
          {mode === 'buy' ? 'Required Approvals' : 'You will receive'}
        </h1>
      </div>
      <ScrollArea className="flex flex-col  max-h-[calc(100vh-10rem)]">
        {basket?.map((token) => (
          <AssetItem key={token.address} token={token} />
        ))}
      </ScrollArea>
    </div>
  )
}

export default AssetList
