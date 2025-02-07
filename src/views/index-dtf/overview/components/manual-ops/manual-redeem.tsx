import { TokenInputBox } from '@/components/ui/swap'
import {
  indexDTFAtom,
  indexDTFBasketAmountsAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { formatEther, parseEther } from 'viem'
import { indexDTFBalanceAtom, zapMintInputAtom } from '../zap-mint/atom'
import TokenLogo from '@/components/token-logo'
import { shortenAddress } from 'utils'
import { Button } from '@/components/ui/button'

const FolioList = ({ input }: { input: string }) => {
  const basket = useAtomValue(indexDTFBasketAtom)
  const prices = useAtomValue(indexDTFBasketPricesAtom)
  const amounts = useAtomValue(indexDTFBasketAmountsAtom)

  const parsedInput = Number(input)

  if (!basket) {
    return null
  }

  return basket.map((basket) => {
    const amount = amounts[basket.address]
    const price = prices[basket.address]
    return (
      <div
        key={basket.address}
        className="flex items-center justify-between border-t p-4"
      >
        <div className="flex items-center gap-1">
          <TokenLogo
            chain={8453}
            address={basket.address}
            width={32}
            height={32}
          />
          <div>
            <p className="text-base font-bold">{basket.name}</p>
            <p className="text-legend font-light text-sm">
              ${basket.symbol} · {shortenAddress(basket.address)}
            </p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold">
            ${formatCurrency(parsedInput * amount * price)}
          </p>
          <p>
            <span className="text-legend">Amount: </span>
            <span className="text-primary font-light">
              {formatTokenAmount(parsedInput * amount)}
            </span>
          </p>
        </div>
      </div>
    )
  })
}

const ManualRedeem = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const [inputAmount, setInputAmount] = useAtom(zapMintInputAtom)
  const indexDTFBalance = useAtomValue(indexDTFBalanceAtom)
  const indxDTFParsedBalance = formatEther(indexDTFBalance)
  const inputPrice = (indexDTFPrice || 0) * Number(inputAmount)
  const onMax = () => setInputAmount(indxDTFParsedBalance)

  const insufficientBalance = parseEther(inputAmount) > indexDTFBalance

  // console.log('aaa', aa, 'bb', bb)

  useEffect(() => {
    setInputAmount('')
  }, [])

  if (!indexDTF) return null

  return (
    <div className="flex flex-col justify-between gap-2 h-full">
      <div className="flex flex-col gap-1">
        <TokenInputBox
          from={{
            price: `$${formatCurrency(inputPrice)}`,
            address: indexDTF.id,
            symbol: indexDTF.token.symbol,
            balance: `${formatCurrency(Number(indxDTFParsedBalance))}`,
            value: inputAmount,
            onChange: setInputAmount,
            onMax,
          }}
        />
        <div className="p-4 font-bold text-base">You will receive:</div>
        <FolioList input={inputAmount} />
      </div>
      <div className="mb-2">
        <Button className="w-full rounded-xl text-base">
          Redeem {indexDTF.token.symbol}
        </Button>
      </div>
    </div>
  )
}

export default ManualRedeem
