import dtfIndexAbi from '@/abis/dtf-index-abi'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useWatchReadContracts } from '@/hooks/useWatchReadContract'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { formatCurrency, shortenAddress } from '@/utils'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { _atomWithDebounce } from 'utils/atoms/atomWithDebounce'
import { erc20Abi, formatEther } from 'viem'
import { useReadContract } from 'wagmi'

const modeAtom = atom<'buy' | 'sell'>('buy')
const amountAtom = _atomWithDebounce('')
const assetDistributionAtom = atom<Record<string, bigint>>({})
const balanceAtom = atom<bigint | undefined>(undefined)
const balanceMapAtom = atom<Record<string, bigint>>({})

const maxRedeemAmountAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)
  const balanceMap = get(balanceMapAtom)

  return balanceMap[indexDTF?.id ?? ''] ?? 0n
})

const maxMintAmountAtom = atom((get) => {
  const indexDTF = get(indexDTFAtom)
  const assetDistribution = get(assetDistributionAtom)
  const balanceMap = get(balanceMapAtom)

  if (
    !indexDTF ||
    !Object.keys(assetDistribution).length ||
    !Object.keys(balanceMap).length
  ) {
    return 0n
  }

  // Initialize max amount as undefined
  let maxAmount: bigint | undefined

  // Iterate through each asset in the distribution
  for (const asset in assetDistribution) {
    // Skip if asset doesn't exist in balance map
    if (!balanceMap[asset]) {
      return 0n
    }

    // Calculate possible mint amount for this asset
    const requiredAmount = assetDistribution[asset]
    const currentBalance = balanceMap[asset]
    const possibleAmount = currentBalance / requiredAmount

    // Update max amount if this is the limiting factor
    if (maxAmount === undefined || possibleAmount < maxAmount) {
      maxAmount = possibleAmount
    }
  }

  // Return 0 if no assets were processed
  return maxAmount ?? 0n
})

const maxAmountAtom = atom((get) => {
  const mode = get(modeAtom)
  const maxMintAmount = get(maxMintAmountAtom)
  const maxRedeemAmount = get(maxRedeemAmountAtom)

  return mode === 'buy' ? maxMintAmount : maxRedeemAmount
})

const usdAmountAtom = atom((get) => {
  const amount = get(amountAtom.currentValueAtom)
  const price = get(indexDTFPriceAtom)

  if (isNaN(Number(amount)) || !price) {
    return 0
  }

  return price * Number(amount)
})

const AssetsRedeem = () => {
  return null
}

const AssetsApprovals = () => {
  return null
}

const balanceCallsAtom = atom((get) => {
  const wallet = get(walletAtom)
  const indexDTF = get(indexDTFAtom)
  const basket = get(indexDTFBasketAtom)
  const chainId = get(chainIdAtom)

  if (!indexDTF || !basket || !wallet) return []

  const addresses = [indexDTF.id, ...basket.map((token) => token.address)]
  const calls = addresses.map((address) => ({
    abi: erc20Abi,
    address,
    functionName: 'balanceOf',
    args: [wallet],
    chainId,
  }))

  return calls
})

const Updater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const setBalance = useSetAtom(balanceMapAtom)
  const calls = useAtomValue(balanceCallsAtom)
  const setAssetDistribution = useSetAtom(assetDistributionAtom)
  const { data } = useWatchReadContracts({
    contracts: calls,
    allowFailure: false,
    query: {
      select: (data) => {
        return data.reduce(
          (acc, curr, index) => {
            acc[calls[index].address] = curr as bigint
            return acc
          },
          {} as Record<string, bigint>
        )
      },
    },
  })

  const { data: assetDistribution } = useReadContract({
    abi: dtfIndexAbi,
    address: indexDTF?.id,
    functionName: 'folio',
    query: {
      select: (data) => {
        const [assets, amounts] = data

        return assets.reduce(
          (acc, asset, index) => {
            acc[asset.toLowerCase()] = amounts[index]
            return acc
          },
          {} as Record<string, bigint>
        )
      },
    },
  })

  useEffect(() => {
    if (data) {
      setBalance(data)
    }
  }, [data])

  useEffect(() => {
    if (assetDistribution) {
      setAssetDistribution(assetDistribution)
    }
  }, [assetDistribution])

  return null
}

const DTFMaxAmount = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const maxAmount = useAtomValue(maxAmountAtom)
  const mode = useAtomValue(modeAtom)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-2">
        <TokenLogo size="xl" />
        <h2 className="text-2xl max-w-52 break-words font-bold">
          {indexDTF?.token.symbol ?? 'DTF'}
        </h2>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-legend">
          Max {mode === 'buy' ? 'Mint' : 'Redeem'}:
        </span>
        <span className="font-bold">
          {formatCurrency(Number(formatEther(maxAmount)), 2, {
            notation: 'compact',
            compactDisplay: 'short',
          })}
        </span>
        <Button variant="outline-primary" size="xs">
          Use
        </Button>
      </div>
    </div>
  )
}

const AmountInput = () => {
  const mode = useAtomValue(modeAtom)
  const amount = useAtomValue(amountAtom.currentValueAtom)
  const setAmount = useSetAtom(amountAtom.debouncedValueAtom)
  const usdAmount = useAtomValue(usdAmountAtom)

  return (
    <div className="flex flex-col">
      <label htmlFor="manual-input">
        {mode === 'buy' ? 'Mint Amount:' : 'Redeem Amount:'}
      </label>

      <div className="flex items-center">
        <div className="flex flex-col flex-grow min-w-0">
          <NumericalInput
            value={amount}
            variant="transparent"
            placeholder="0"
            onChange={setAmount}
            autoFocus
          />
          <div className="w-full overflow-hidden">
            <span className="text-legend mt-1.5 block max-w-52 truncate">
              ${formatCurrency(usdAmount, 2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const InputBox = () => (
  <div className="p-4 bg-muted rounded-3xl grid grid-cols-[1fr_auto] overflow-hidden items-end gap-4">
    <AmountInput />
    <DTFMaxAmount />
  </div>
)

const ModeSelector = () => {
  const [mode, setMode] = useAtom(modeAtom)

  return (
    <ToggleGroup
      type="single"
      className="bg-muted-foreground/10 p-1 rounded-xl justify-start w-fit"
      value={mode}
      onValueChange={(value) => setMode(value as 'buy' | 'sell')}
    >
      {['buy', 'sell'].map((option) => (
        <ToggleGroupItem
          key={option}
          value={option.toString()}
          className="px-5 capitalize h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary flex-grow"
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

// const ApproveAsset = ({
//   address,
//   decimals,
//   amount,
// }: {
//   address: Address
//   decimals: number
//   amount: number
// }) => {
//   const { writeContract, isPending, isSuccess } = useWriteContract()
//   const chainId = useAtomValue(chainIdAtom)
//   const assetsAllowance = useAtomValue(formattedAssetsAllowanceAtom)

//   const approve = () => {
//     writeContract({
//       abi: erc20Abi,
//       address,
//       functionName: 'approve',
//       args: [
//         INDEX_DEPLOYER_ADDRESS[chainId],
//         parseUnits((amount * 2).toString(), decimals),
//       ],
//     })
//   }

//   if (
//     isSuccess ||
//     (assetsAllowance[address] && amount && assetsAllowance[address] >= amount)
//   ) {
//     return <CheckCircle2 className="mx-2" color="green" size={24} />
//   }

//   return (
//     <Button
//       variant="outline-primary"
//       className="rounded-full"
//       onClick={approve}
//       disabled={isPending || !amount}
//     >
//       {isPending ? 'Approving...' : 'Approve'}
//     </Button>
//   )
// }

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
      {/* <TokenBalance
        required={basketAmountMap[token.address]}
        address={token.address}
        decimals={token.decimals}
      />
      <ApproveAsset
        address={token.address}
        decimals={token.decimals}
        amount={basketAmountMap[token.address]}
      /> */}
    </div>
  )
}

const AssetList = () => {
  const mode = useAtomValue(modeAtom)
  const basket = useAtomValue(indexDTFBasketAtom)

  return (
    <div className="rounded-3xl bg-card border">
      <div className="p-4 border-b">
        <h1>{mode === 'buy' ? 'Required Approvals' : 'You will receive'}</h1>
      </div>
      <ScrollArea className="flex flex-col  h-[calc(100vh-10rem)]">
        {basket?.map((token) => (
          <AssetItem key={token.address} token={token} />
        ))}
      </ScrollArea>
    </div>
  )
}

const SubmitButton = () => {
  const mode = useAtomValue(modeAtom)
  const amount = useAtomValue(amountAtom.currentValueAtom)

  return (
    <div className="flex flex-col gap-2">
      <Button>{mode === 'buy' ? 'Mint' : 'Redeem'}</Button>
    </div>
  )
}

const IndexDTFManualIssuance = () => {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 pr-2 ">
        <div className="flex flex-col gap-2 border bg-card rounded-3xl p-4 h-fit">
          <ModeSelector />
          <InputBox />
          <SubmitButton />
        </div>
        <AssetList />
      </div>
      <Updater />
    </>
  )
}

export default IndexDTFManualIssuance
