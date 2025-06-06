import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { Undo } from 'lucide-react'
import { removedBasketTokensAtom } from '../atoms'

const DTFSettingsProposalChanges = () => {
  const [removedBasketTokens, setRemovedBasketTokens] = useAtom(
    removedBasketTokensAtom
  )
  const chainId = useAtomValue(chainIdAtom)

  if (removedBasketTokens.length === 0) {
    return <div className=" p-6 text-center text-legend">No changes</div>
  }

  const handleRevert = (address: string) => {
    setRemovedBasketTokens(
      removedBasketTokens.filter((token) => token.address !== address)
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-legend mb-3">
        The following tokens will be removed from the basket:
      </div>

      {removedBasketTokens.map((token, index) => (
        <div
          key={token.address}
          className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
            {index + 1}
          </div>
          <TokenLogo size="sm" chain={chainId} address={token.address} />
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium text-destructive">
              {token.name}
            </span>
            <span className="text-xs text-destructive/70">{token.symbol}</span>
          </div>
          <Button
            variant="outline"
            size="icon-rounded"
            onClick={() => handleRevert(token.address)}
            className="text-destructive bg-destructive/10"
          >
            <Undo size={16} />
          </Button>
        </div>
      ))}
    </div>
  )
}

export default DTFSettingsProposalChanges
