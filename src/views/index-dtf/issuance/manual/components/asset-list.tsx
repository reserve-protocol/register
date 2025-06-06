import USDT from '@/abis/USDT'
import { DecimalDisplay } from '@/components/decimal-display'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import Help from '@/components/ui/help'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import useIsUSDT from '@/hooks/useIsUSDT'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { formatCurrency, shortenAddress } from '@/utils'
import { BIGINT_MAX } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue } from 'jotai'
import { CheckCircle2, TextCursorInput, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Address, erc20Abi, formatUnits } from 'viem'
import { useWriteContract } from 'wagmi'
import {
  allowanceMapAtom,
  assetAmountsMapAtom,
  balanceMapAtom,
  modeAtom,
  unlimitedApprovalAtom,
} from '../atoms'

const ApproveAsset = ({ address }: { address: Address }) => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const { writeContract, isPending, isSuccess } = useWriteContract()
  const {
    writeContract: writeContractRevoke,
    isPending: isPendingRevoke,
    isSuccess: isSuccessRevoke,
  } = useWriteContract()
  const chainId = useAtomValue(chainIdAtom)
  const allowanceMap = useAtomValue(allowanceMapAtom)
  const assetAmountsMap = useAtomValue(assetAmountsMapAtom)
  const amount = assetAmountsMap[address] ?? 0n
  const isUnlimited = useAtomValue(unlimitedApprovalAtom)

  const { isUSDT, needsRevoke } = useIsUSDT(address, chainId, indexDTF?.id)

  if (!amount) return null

  const revoke = () => {
    if (!indexDTF) return
    writeContractRevoke({
      abi: USDT,
      address,
      functionName: 'approve',
      args: [indexDTF.id, 0n],
      chainId,
    })
  }

  const approve = () => {
    if (!indexDTF || !assetAmountsMap[address]) return

    const amount =
      isUnlimited || isUSDT ? BIGINT_MAX : assetAmountsMap[address] * 2n

    writeContract({
      abi: isUSDT ? USDT : erc20Abi,
      address,
      functionName: 'approve',
      args: [indexDTF.id, amount],
      chainId,
    })
  }

  if (
    isSuccess ||
    (allowanceMap[address] && amount && allowanceMap[address] >= amount)
  ) {
    return <CheckCircle2 className="mx-2" color="green" size={24} />
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
          <DecimalDisplay value={amount} />
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
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1">
        <Wallet size={16} />
        <span className="font-semibold">
          <DecimalDisplay value={numericBalance} />
        </span>
      </div>
      <div className="flex items-center gap-1">
        <TextCursorInput size={16} />
        <span className="font-semibold">Required:</span>{' '}
        <span
          className={cn(
            'font-semibold',
            balance >= required ? 'text-success' : 'text-destructive',
            required === 0n && 'text-inherit'
          )}
        >
          <DecimalDisplay value={numericRequired ?? 0} />
        </span>
      </div>
    </div>
  )
}

const MintAssetAmount = ({ token }: { token: Token }) => {
  return (
    <div className="flex items-center justify-between gap-2 min-h-[32px]">
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
  const mode = useAtomValue(modeAtom)

  return (
    <div
      className={cn(
        'flex gap-2 border-t p-4',
        mode === 'buy' ? 'flex-col' : 'justify-between'
      )}
    >
      <div className="flex items-center flex-wrap gap-2">
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
            <Link
              to={getExplorerLink(
                token.address,
                chainId,
                ExplorerDataType.TOKEN
              )}
              target="_blank"
              className="hover:text-primary hover:underline"
            >
              {shortenAddress(token.address)}
            </Link>
          </div>
        </div>
      </div>
      <AssetAmount token={token} />
    </div>
  )
}

const Placeholder = () => {
  return (
    <div className="flex flex-col">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center border-t gap-2 p-2">
          <Skeleton className="rounded-full h-8 w-8" />
          <Skeleton className="w-40 h-11" />
          <Skeleton className="ml-auto w-16 h-8" />
        </div>
      ))}
    </div>
  )
}

const UnlimitedApproval = () => {
  const [unlimitedApproval, setUnlimitedApproval] = useAtom(
    unlimitedApprovalAtom
  )

  return (
    <div
      role="button"
      onClick={() => setUnlimitedApproval(!unlimitedApproval)}
      className="flex items-center gap-2 ml-auto text-legend text-sm border rounded-3xl p-1 px-3 cursor-pointer hover:bg-primary/10 hover:text-primary"
    >
      <span>Unlimited</span>
      <Checkbox className="h-4 w-4" checked={unlimitedApproval} />
    </div>
  )
}

const AssetList = () => {
  const mode = useAtomValue(modeAtom)
  const basket = useAtomValue(indexDTFBasketAtom)

  return (
    <div className="rounded-3xl bg-card border h-fit">
      <div className="p-4 border-b flex items-center h-16">
        <h1 className="font-bold">
          {mode === 'buy' ? 'Required Approvals' : 'You will receive'}
        </h1>
        {mode === 'buy' && <UnlimitedApproval />}
      </div>
      <ScrollArea className="flex flex-col lg:max-h-[calc(100vh-10rem)]">
        {basket?.map((token) => (
          <AssetItem key={token.address} token={token} />
        ))}
        {!basket && <Placeholder />}
      </ScrollArea>
    </div>
  )
}

export default AssetList
