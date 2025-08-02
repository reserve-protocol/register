import TokenSelectorDrawer, { TokenDrawerTrigger } from '@/components/token-selector-drawer'
import { Token } from '@/types'
import { useAtomValue } from 'jotai'
import { basketItemsAtom } from './atoms'
import { useBasketSetup } from './hooks/use-basket-setup'

interface TokenSelectorProps {
  className?: string
}

export const TokenSelector = ({ className }: TokenSelectorProps) => {
  const basketItems = useAtomValue(basketItemsAtom)
  const { addTokens } = useBasketSetup()

  const currentTokens = Object.values(basketItems).map(item => item.token)

  const handleAddTokens = (tokens: Token[]) => {
    addTokens(tokens)
  }

  return (
    <TokenSelectorDrawer
      selectedTokens={currentTokens}
      onAdd={handleAddTokens}
    >
      <TokenDrawerTrigger className={className} />
    </TokenSelectorDrawer>
  )
}