import TokenLogo from '@/components/icons/TokenLogo'
import { Token } from '@/types'
import { formatCurrency, shortenAddress } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { XIcon } from 'lucide-react'
import { basketAtom, tokenPricesAtom } from '../../atoms'
import BasicInput from '../../components/basic-input'
import { useFormContext } from 'react-hook-form'

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
  return (
    <BasicInput
      className="max-w-32"
      fieldName={`tokensDistribution.${tokenIndex}`}
      label="%"
      placeholder="0"
      defaultValue={0}
    />
  )
}

const TokenPreview = ({
  address,
  name,
  symbol,
  index,
}: Token & { index: number }) => {
  const form = useFormContext()

  const [initialValue, tokenDistribution] = form.watch([
    `initialValue`,
    `tokensDistribution.${index}`,
  ])

  const tokenPrices = useAtomValue(tokenPricesAtom)
  const tokenPrice = tokenPrices[address]

  const tokenQty =
    (initialValue * (tokenDistribution / 100)) / (tokenPrice || 1)

  return (
    <label
      htmlFor={address}
      role="div"
      className="w-full flex items-center gap-2 justify-between p-4 [&:not(:last-child)]:border-b-[1px]"
    >
      <div className="flex gap-2">
        <TokenLogo symbol={symbol} width={32} />
        <div className="flex flex-col">
          <div className="text-base font-bold">{name}</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="text-primary">
              {formatCurrency(tokenQty, 6, {
                minimumFractionDigits: 0,
              })}{' '}
              {symbol}
            </span>
            <span>•</span>
            <span>{shortenAddress(address)}</span>
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

const BasketPreview = () => {
  const basket = useAtomValue(basketAtom)

  if (basket.length === 0) return null

  return (
    <div className="flex flex-col mb-2 mx-2 rounded-xl bg-muted/70">
      {basket.map((token, index) => (
        <TokenPreview key={token.address} {...token} index={index} />
      ))}
    </div>
  )
}

export default BasketPreview
