import TokenLogo from '@/components/icons/TokenLogo'
import { Token } from '@/types'
import { shortenAddress } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { DollarSign, XIcon } from 'lucide-react'
import { basketAtom } from '../atoms'
import { Input } from 'theme-ui'

const RemoveTokenButton = ({ address }: Pick<Token, 'address'>) => {
  const setBasket = useSetAtom(basketAtom)

  const removeToken = () => {
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

const BasketValue = () => {
  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <DollarSign size={24} strokeWidth={1.5} />
        <div className="text-base font-bold">0.00</div>
      </div>
      <Input></Input>
    </div>
  )
}

const TokenPreview = ({ address, name, symbol }: Token) => {
  return (
    <label
      htmlFor={address}
      role="div"
      className="w-full flex items-center gap-2 justify-between p-4 cursor-pointer [&:not(:last-child)]:border-b-[1px]"
    >
      <div className="flex gap-2">
        <TokenLogo symbol={symbol} width={32} />
        <div className="flex flex-col">
          <div className="text-base font-bold">{name}</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{symbol}</span>
            <span>•</span>
            <span>{shortenAddress(address)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-[12px]">
        <RemoveTokenButton address={address} />
      </div>
    </label>
  )
}

const BasketPreview = () => {
  const basket = useAtomValue(basketAtom)

  if (basket.length === 0) return null

  return (
    <div className="flex flex-col mb-2 mx-2 rounded-xl bg-muted/70">
      {basket.map((token) => (
        <TokenPreview key={token.address} {...token} />
      ))}
    </div>
  )
}

export default BasketPreview
