import TokenLogo from '@/components/token-logo'
import ExplorerAddress from '@/components/utils/explorer-address'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { formatCurrency, formatPercentage } from '@/utils'
import { ExplorerDataType } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { CircleAlert, XIcon } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import {
  basketAtom,
  basketDerivedSharesAtom,
  BasketInputType,
  basketInputTypeAtom,
} from '../../atoms'
import BasicInput from '../../components/basic-input'
import { Decimal } from '../../utils/decimals'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

const RemoveTokenButton = ({
  tokenIndex,
  address,
}: { tokenIndex: number } & Pick<Token, 'address'>) => {
  const { getValues, setValue } = useFormContext()
  const setBasket = useSetAtom(basketAtom)

  const removeToken = () => {
    const currentTokens = getValues('tokensDistribution') as number[]
    const updatedTokens = currentTokens.filter(
      (_, index) => index !== tokenIndex
    )
    setValue('tokensDistribution', updatedTokens)

    setBasket((prev) => prev.filter((token) => token.address !== address))
  }

  return (
    <div
      className="border border-muted-foreground/20 rounded-full p-1 hover:bg-muted-foreground/20"
      role="button"
      onClick={removeToken}
    >
      <XIcon size={24} strokeWidth={1.5} />
    </div>
  )
}

const TokenDistribution = ({ tokenIndex }: { tokenIndex: number }) => {
  const basketInputType = useAtomValue(basketInputTypeAtom)

  return (
    <BasicInput
      type="number"
      className={cn('max-w-32', basketInputType === 'unit' && 'max-w-40')}
      fieldName={`tokensDistribution.${tokenIndex}.percentage`}
      label={basketInputType === 'unit' ? 'Units' : '%'}
      placeholder="0"
      defaultValue={0}
      decimalPlaces={basketInputType === 'unit' ? 18 : 2}
    />
  )
}

const TokenPreview = ({
  address,
  name,
  logoURI,
  symbol,
  index,
  price,
}: Token & { index: number }) => {
  const chainId = useAtomValue(chainIdAtom)
  const form = useFormContext()
  const basketInputType = useAtomValue(basketInputTypeAtom)
  const basketDerivedShares = useAtomValue(basketDerivedSharesAtom)

  const [initialValue, tokenDistribution] = form.watch([
    `initialValue`,
    `tokensDistribution.${index}.percentage`,
  ])

  const shares =
    basketInputType === 'unit'
      ? Number(basketDerivedShares?.[address] ?? 0)
      : tokenDistribution

  let tokenQty =
    price && price > 0 ? (initialValue * (shares / 100)) / price : undefined

  const tokenUSD =
    tokenQty !== undefined && price ? tokenQty * price : undefined

  return (
    <label
      htmlFor={address}
      role="div"
      className="w-full flex items-center gap-2 justify-between p-4 [&:not(:last-child)]:border-b-[1px]"
    >
      <div className="flex items-center gap-2">
        <TokenLogo
          symbol={symbol}
          src={logoURI}
          address={address}
          chain={chainId}
          size="xl"
        />
        <div className="flex flex-col">
          <div className="text-base font-bold">{name}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {basketInputType === 'unit' ? (
              <span className="text-primary">{formatPercentage(shares)}</span>
            ) : tokenQty !== undefined ? (
              <span className="text-primary">
                {tokenQty < 1
                  ? formatCurrency(tokenQty, 0, {
                      maximumSignificantDigits: 4,
                    })
                  : formatCurrency(tokenQty, 2, {
                      minimumFractionDigits: 0,
                    })}{' '}
                {symbol}
              </span>
            ) : (
              <span className="text-muted-foreground">{symbol}</span>
            )}

            <span className="text-foreground text-[8px]">•</span>
            {tokenUSD !== undefined ? (
              <span className="text-foreground">
                $
                {formatCurrency(tokenUSD, 2, {
                  minimumFractionDigits: 0,
                })}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-red-500 bg-red-500/10 rounded-full px-2 py-0.5">
                <CircleAlert size={14} />
                <span>Price not available</span>
              </div>
            )}
            <span className="text-foreground text-[8px]">•</span>
            <ExplorerAddress
              address={address}
              chain={chainId}
              type={ExplorerDataType.TOKEN}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-[12px]">
        <TokenDistribution tokenIndex={index} />
        <RemoveTokenButton tokenIndex={index} address={address} />
      </div>
    </label>
  )
}

const RemainingAllocation = () => {
  const form = useFormContext()
  const tokenDistribution = form.watch(`tokensDistribution`)
  const basketInputType = useAtomValue(basketInputTypeAtom)

  if (basketInputType === 'unit') return null

  const remaining = new Decimal(100).minus(
    tokenDistribution.reduce(
      (sum: Decimal, { percentage }: { percentage: string }) =>
        sum.plus(new Decimal(percentage || 0)),
      new Decimal(0)
    )
  )

  const isNegative = remaining.isNegative()
  const absValue = remaining.abs()
  const displayValue = absValue.toDisplayString()

  return (
    <div className="text-base ml-auto px-6">
      <span className="text-muted-foreground">Remaining allocation:</span>{' '}
      <span className={isNegative ? 'text-red-500' : ''}>
        {isNegative ? `-${displayValue}` : displayValue}%
      </span>
    </div>
  )
}

const BasketSetting = () => {
  const [basketInputType, setBasketInputType] = useAtom(basketInputTypeAtom)
  const { setValue } = useFormContext()

  return (
    <div className="flex items-center">
      <ToggleGroup
        type="single"
        className="ml-3 bg-muted-foreground/10 p-1 rounded-lg justify-start w-max"
        value={basketInputType}
        onValueChange={(value) => {
          setBasketInputType(value as BasketInputType)
          setValue('inputType', value as BasketInputType)
        }}
      >
        <ToggleGroupItem
          className="px-3 rounded-md data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
          value="unit"
        >
          Unit
        </ToggleGroupItem>
        <ToggleGroupItem
          className="px-3 rounded-md data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary"
          value="share"
        >
          Share
        </ToggleGroupItem>
      </ToggleGroup>
      <RemainingAllocation />
    </div>
  )
}

const BasketPreview = () => {
  const basket = useAtomValue(basketAtom)

  if (basket.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <BasketSetting />
      <div className="flex flex-col mb-2 mx-2 rounded-xl bg-muted/70">
        {basket.map((token, index) => (
          <TokenPreview key={token.address} {...token} index={index} />
        ))}
      </div>
    </div>
  )
}

export default BasketPreview
