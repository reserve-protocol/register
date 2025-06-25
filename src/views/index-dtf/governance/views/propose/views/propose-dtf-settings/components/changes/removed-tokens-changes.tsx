import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { useAtom, useAtomValue } from 'jotai'
import { Trash, Undo } from 'lucide-react'
import { removedBasketTokensAtom } from '../../atoms'
import { ChangeSection } from './shared'

const RemovedTokensChanges = () => {
  const chainId = useAtomValue(chainIdAtom)
  const [removedBasketTokens, setRemovedBasketTokens] = useAtom(removedBasketTokensAtom)
  
  if (removedBasketTokens.length === 0) return null

  const handleRevertToken = (address: string) => {
    setRemovedBasketTokens(
      removedBasketTokens.filter((token) => token.address !== address)
    )
  }

  return (
    <ChangeSection title="Remove Dust Tokens" icon={<Trash size={16} className="text-destructive" />}>
      <div className="space-y-2">
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
              onClick={() => handleRevertToken(token.address)}
              className="text-destructive bg-destructive/10"
            >
              <Undo size={16} />
            </Button>
          </div>
        ))}
      </div>
    </ChangeSection>
  )
}

export default RemovedTokensChanges