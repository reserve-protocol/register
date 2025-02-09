import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { NumericalInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'
import { formatCurrency, safeParseEther } from '@/utils'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Address, formatEther, formatUnits } from 'viem'
import {
  allowanceMapAtom,
  amountAtom,
  assetAmountsMapAtom,
  balanceMapAtom,
  maxAmountAtom,
  modeAtom,
  usdAmountAtom,
} from './atoms'
import AssetList from './components/asset-list'
import Updater from './updater'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/utils/constants'
import { useWriteContract } from 'wagmi'
import { useEffect } from 'react'
import dtfIndexAbi from '@/abis/dtf-index-abi'
import { chainIdAtom, walletAtom } from '@/state/atoms'

const DTFMaxAmount = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const maxAmount = useAtomValue(maxAmountAtom)
  const setMaxAmount = useSetAtom(amountAtom.debouncedValueAtom)
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
        <span className="text-legend">Max:</span>
        <span className="font-bold">
          {formatCurrency(Number(formatEther(maxAmount)), 2, {
            notation: 'compact',
            compactDisplay: 'short',
          })}
        </span>
        <Button
          variant="outline-primary"
          size="xs"
          onClick={() => setMaxAmount(formatEther(maxAmount))}
        >
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
  const setAmount = useSetAtom(amountAtom.debouncedValueAtom)

  return (
    <ToggleGroup
      type="single"
      className="bg-muted-foreground/10 p-1 rounded-xl justify-start w-fit"
      value={mode}
      onValueChange={(value) => {
        setMode(value as 'buy' | 'sell')
        setAmount('')
      }}
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

const isValidAtom = atom<[boolean, string]>((get) => {
  const mode = get(modeAtom)
  const amount = get(amountAtom.debouncedValueAtom)
  const indexDTF = get(indexDTFAtom)
  const balanceMap = get(balanceMapAtom)
  const allowanceMap = get(allowanceMapAtom)
  const requiredAmounts = get(assetAmountsMapAtom)
  const basket = get(indexDTFBasketAtom)

  if (
    !indexDTF ||
    isNaN(Number(amount)) ||
    !Object.keys(balanceMap).length ||
    !Object.keys(allowanceMap).length ||
    !Object.keys(requiredAmounts).length
  )
    return [false, '']

  const parsed = basket?.map((token) => {
    return {
      ...token,
      required: requiredAmounts[token.address],
      balance: balanceMap[token.address],
      allowance: allowanceMap[token.address],
      parsedRequired: formatUnits(
        requiredAmounts[token.address] ?? 0n,
        token.decimals
      ),
      parsedBalance: formatUnits(
        balanceMap[token.address] ?? 0n,
        token.decimals
      ),
      parsedAllowance: formatUnits(
        allowanceMap[token.address] ?? 0n,
        token.decimals
      ),
    }
  })

  console.log('parsed', parsed)

  // Simple case, on redeem just check if the balance is enough
  if (mode === 'sell') {
    const isValid = (balanceMap[indexDTF.id] ?? 0n) >= safeParseEther(amount)
    return [isValid, isValid ? '' : 'Insufficient balance']
  }

  // On mint, check if the allowance and balance is enough for each asset
  for (const asset of Object.keys(requiredAmounts)) {
    if ((balanceMap[asset] ?? 0n) < requiredAmounts[asset]) {
      return [false, 'Insufficient balance']
    }
    console.log('allowances', allowanceMap[asset] ?? 0n)
    console.log('required', requiredAmounts[asset])
    if ((allowanceMap[asset] ?? 0n) < requiredAmounts[asset]) {
      return [false, 'Insufficient allowance']
    }
  }

  return [true, '']
})

const SubmitButton = () => {
  const mode = useAtomValue(modeAtom)
  const amount = useAtomValue(amountAtom.currentValueAtom)
  const { data, isPending, isError, writeContract, reset } = useWriteContract()
  const requiredAmounts = useAtomValue(assetAmountsMapAtom)
  const [isValid, error] = useAtomValue(isValidAtom)
  const wallet = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  useEffect(() => {
    reset()
  }, [mode])

  const handleSubmit = () => {
    if (!isValid || !indexDTF || !wallet) return

    if (mode === 'buy') {
      writeContract({
        address: indexDTF.id,
        abi: dtfIndexAbi,
        functionName: 'mint',
        args: [safeParseEther(amount), wallet],
        chainId,
      })
    } else {
      const assets: Address[] = []
      const minAmounts: bigint[] = []

      for (const asset of Object.keys(requiredAmounts)) {
        assets.push(asset as Address)
        minAmounts.push(requiredAmounts[asset])
      }

      console.log('args', [
        safeParseEther(amount),
        wallet,
        assets as `0x${string}`[],
        minAmounts as bigint[],
      ])

      writeContract({
        address: indexDTF.id,
        abi: dtfIndexAbi,
        functionName: 'redeem',
        args: [
          safeParseEther(amount),
          wallet,
          assets as `0x${string}`[],
          minAmounts as bigint[],
        ],
        chainId,
      })
    }
  }

  let label = mode === 'buy' ? 'Mint' : 'Redeem'

  if (isPending) {
    label = 'Please sign in wallet...'
  }

  return (
    <div className="flex flex-col gap-2">
      <Button disabled={!isValid} onClick={handleSubmit}>
        {label}
      </Button>
      {error && <p className="text-destructive">{error}</p>}
    </div>
  )
}

const IndexDTFManualIssuance = () => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 pr-2 ">
        <div>
          <div className="flex flex-col gap-2 border bg-card rounded-3xl p-4 h-fit">
            <ModeSelector />
            <InputBox />
            <SubmitButton />
          </div>
          <div className="mt-4 rounded-3xl border p-4 flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
              quos.
            </p>
            <Link to={`../${ROUTES.ISSUANCE}`}>
              <Button variant="outline-primary">Simple mode</Button>
            </Link>
          </div>
        </div>

        <AssetList />
      </div>

      <Updater />
    </div>
  )
}

export default IndexDTFManualIssuance
