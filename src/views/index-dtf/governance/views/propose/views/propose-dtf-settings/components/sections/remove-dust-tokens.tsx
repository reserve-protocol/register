import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFBasketAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue } from 'jotai'
import { ArrowUpRight, Coins, Trash } from 'lucide-react'
import { currentBasketTokensAtom, removedBasketTokensAtom } from '../../atoms'

const BasketToken = ({ token }: { token: Token }) => {
  const chainId = useAtomValue(chainIdAtom)
  const [removedBasketTokens, setRemovedBasketTokens] = useAtom(
    removedBasketTokensAtom
  )

  const handleRemove = () =>
    setRemovedBasketTokens([...removedBasketTokens, token])

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card">
      <TokenLogo
        size="lg"
        chain={chainId}
        address={token.address.toLowerCase()}
      />
      <div className="flex flex-col mr-auto">
        <h4 className="text-sm font-medium">
          {token.name} ({token.symbol})
        </h4>
        <a
          className="text-xs text-legend flex items-center gap-1 hover:text-primary"
          target="_blank"
          href={getExplorerLink(token.address, chainId, ExplorerDataType.TOKEN)}
          tabIndex={0}
          aria-label={`View ${token.symbol} on block explorer`}
          rel="noopener noreferrer"
        >
          {shortenAddress(token.address)}
          <ArrowUpRight size={12} />
        </a>
      </div>
      <Button
        variant="outline"
        size="icon-rounded"
        onClick={handleRemove}
        aria-label={`Remove ${token.symbol} from basket`}
        tabIndex={0}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash size={16} />
      </Button>
    </div>
  )
}

const BasketTokensList = () => {
  const currentBasketTokens = useAtomValue(currentBasketTokensAtom)
  const basket = useAtomValue(indexDTFBasketAtom)

  if (!basket) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        Loading dust tokens...
      </div>
    )
  }

  if (!currentBasketTokens || currentBasketTokens.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No tokens to remove
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {currentBasketTokens.map((token) => (
        <BasketToken key={token.address} token={token} />
      ))}
    </div>
  )
}

const RemoveDustTokens = () => {
  return (
    <div>
      <p className="px-6">
        There could be the case of a dust token balance remaining in the basket,
        you can remove it here.
      </p>
      <BasketTokensList />
    </div>
  )
}

export default RemoveDustTokens
