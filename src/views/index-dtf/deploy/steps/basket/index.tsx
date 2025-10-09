import BasketPreview from './basket-preview'
import BasketValue from './basket-value'
import NextButton from '../../components/next-button'
import TokenSelector from './token-selector'
import BasketCsvSetup from './basket-csv-setup'
import { useFormContext } from 'react-hook-form'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  basketAtom,
  basketDerivedSharesAtom,
  basketInputTypeAtom,
} from '../../atoms'
import { useEffect, useMemo } from 'react'
import { Token } from '@/types'
import { formatUnits, parseUnits } from 'viem'
import { getCurrentBasket } from '@/lib/index-rebalance/utils'

const Description = () => (
  <div className="px-6 pb-6 text-base">
    An Index DTF is a tokenized basket of assets. Please add the tokens that
    will compose your index DTF basket at launch. The basket can be changed by
    governance in the future.
  </div>
)

const BasketUpdater = () => {
  const basket = useAtomValue(basketAtom)
  const basketInputType = useAtomValue(basketInputTypeAtom)
  const { watch } = useFormContext()
  const basketConfiguration: { address: string; percentage: string }[] =
    watch('tokensDistribution')
  const setBasketDerivedShares = useSetAtom(basketDerivedSharesAtom)

  const basketDerivedShares = useMemo(() => {
    if (basketInputType === 'unit') {
      try {
        const tokenMap = basket.reduce(
          (acc, token) => {
            acc[token.address] = token
            return acc
          },
          {} as Record<string, Token>
        )

        const bals: bigint[] = []
        const decimals: bigint[] = []
        const prices: number[] = []

        for (const { address, percentage } of basketConfiguration) {
          const d = tokenMap[address].decimals || 18
          bals.push(parseUnits(percentage || '0', d))
          decimals.push(BigInt(d))
          prices.push(tokenMap[address].price || 0)
        }

        const targetBasket = getCurrentBasket(bals, decimals, prices)

        return basketConfiguration.reduce(
          (acc, { address }, index) => {
            acc[address] = formatUnits(targetBasket[index], 16)
            return acc
          },
          {} as Record<string, string>
        )
      } catch (error) {
        console.error('Invalid basket', error)
      }
    }

    return undefined
  }, [JSON.stringify(basketConfiguration), basket, basketInputType])

  useEffect(() => {
    setBasketDerivedShares(basketDerivedShares)
  }, [basketDerivedShares])

  return null
}

const FTokenBasket = () => {
  return (
    <>
      <Description />
      <BasketCsvSetup />
      <BasketPreview />
      <TokenSelector />
      <BasketValue />
      <NextButton />
      <BasketUpdater />
    </>
  )
}

export default FTokenBasket
