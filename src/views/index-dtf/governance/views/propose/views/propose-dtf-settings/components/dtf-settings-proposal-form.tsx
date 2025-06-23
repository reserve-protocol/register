import { Button } from '@/components/ui/button'
import {
  ArrowLeftIcon,
  ArrowUpRight,
  Trash,
  AlertTriangle,
  Coins,
} from 'lucide-react'
import TokenLogo from '@/components/token-logo'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { shortenAddress } from '@/utils'
import { ROUTES } from '@/utils/constants'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue } from 'jotai'
import { Link } from 'react-router-dom'
import {
  currentBasketTokensAtom,
  removedBasketTokensAtom,
  isProposalValidAtom,
} from '../atoms'
import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'

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

const RemovedToken = ({ token }: { token: Token }) => {
  const chainId = useAtomValue(chainIdAtom)
  const [removedBasketTokens, setRemovedBasketTokens] = useAtom(
    removedBasketTokensAtom
  )

  const handleRestore = () => {
    setRemovedBasketTokens(
      removedBasketTokens.filter(
        (t) => t.address.toLowerCase() !== token.address.toLowerCase()
      )
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 rounded-xl border border-destructive/20 bg-destructive/5">
      <TokenLogo
        size="lg"
        chain={chainId}
        symbol={token.symbol}
        address={token.address}
      />
      <div className="flex flex-col mr-auto">
        <h4 className="text-sm font-medium text-destructive">
          {token.name} ({token.symbol})
        </h4>
        <span className="text-xs text-destructive/70">
          Will be removed from basket
        </span>
      </div>
      <Button
        variant="outline"
        size="icon-rounded"
        onClick={handleRestore}
        aria-label={`Restore ${token.symbol} to basket`}
        tabIndex={0}
        className="border-destructive/20 hover:bg-destructive/10"
      >
        <ArrowLeftIcon size={16} />
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
    <div className="flex flex-col gap-2 mt-4">
      {currentBasketTokens.map((token) => (
        <BasketToken key={token.address} token={token} />
      ))}
    </div>
  )
}

const DTFSettingsProposalForm = () => {
  return (
    <div className="w-full bg-secondary rounded-4xl pb-0.5 h-fit">
      <div className="p-4 pb-3 flex items-center gap-2">
        <Link
          to={`../${ROUTES.GOVERNANCE}/${ROUTES.GOVERNANCE_PROPOSE}`}
          className="sm:ml-3"
        >
          <Button variant="outline" size="icon-rounded">
            <ArrowLeftIcon size={24} strokeWidth={1.5} />
          </Button>
        </Link>
        <h1 className="font-bold text-xl">DTF settings proposal</h1>
      </div>
      <div className="rounded-3xl bg-card m-1 border-none">
        <div className="p-4 sm:p-6 pb-3">
          <div className="rounded-full w-fit flex-shrink-0 p-2 bg-primary/10 text-primary">
            <Coins size={16} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary mt-6 mb-2">
            Remove tokens from basket
          </h2>
          <p>
            There could be the case of a dust token balance remaining in the
            basket, you can remove it here.
          </p>
          <BasketTokensList />
        </div>
      </div>
    </div>
  )
}

export default DTFSettingsProposalForm
