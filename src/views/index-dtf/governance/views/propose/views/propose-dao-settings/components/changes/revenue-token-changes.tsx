import TokenLogo from '@/components/token-logo'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue } from 'jotai'
import { ArrowUpRight, Coins } from 'lucide-react'
import {
  addedRewardTokensAtom,
  removedRewardTokensAtom,
  validAddedRewardTokensAtom,
} from '../../atoms'
import { ChangeSection, RevertButton } from './shared'

const RewardTokenItem = ({
  token,
  type,
  onRevert,
  id,
}: {
  token: Token
  type: 'added' | 'removed'
  onRevert: () => void
  id?: string
}) => {
  const chainId = useAtomValue(chainIdAtom)

  return (
    <div className="flex items-center gap-2 p-4 rounded-2xl bg-muted/70 border" key={id || token.address}>
      <TokenLogo size="lg" chain={chainId} address={token.address} />
      <div className="flex flex-col mr-auto">
        <div className="text-sm font-medium">
          {token.name} (${token.symbol})
        </div>
        <a
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
          target="_blank"
          href={getExplorerLink(token.address, chainId, ExplorerDataType.TOKEN)}
          tabIndex={0}
          aria-label={`View ${token.symbol} on block explorer`}
        >
          {token.address}
          <ArrowUpRight size={12} />
        </a>
        <div className={`text-xs mt-1 ${type === 'added' ? 'text-success' : 'text-destructive'}`}>
          {type === 'added' ? 'Added reward token' : 'Removed reward token'}
        </div>
      </div>
      <RevertButton size="icon-rounded" onClick={onRevert} />
    </div>
  )
}

const RemovedRewardTokens = () => {
  const [removed, setRemoved] = useAtom(removedRewardTokensAtom)

  const handleRevert = (address: string) => {
    setRemoved(removed.filter((token) => token.address !== address))
  }

  if (!removed.length) return null

  return (
    <>
      {removed.map((token) => (
        <RewardTokenItem
          key={token.address}
          token={token}
          type="removed"
          onRevert={() => handleRevert(token.address)}
        />
      ))}
    </>
  )
}

const AddedRewardTokens = () => {
  const added = useAtomValue(validAddedRewardTokensAtom)
  const [_added, setAdded] = useAtom(addedRewardTokensAtom)

  const handleRevert = (id: string) => {
    const updatedTokens = { ..._added }
    delete updatedTokens[id]
    setAdded(updatedTokens)
  }

  if (!added.length) return null

  return (
    <>
      {added.map((id) => {
        const token = _added[id]
        if (!token) return null

        return (
          <RewardTokenItem
            key={id}
            id={id}
            token={token}
            type="added"
            onRevert={() => handleRevert(id)}
          />
        )
      })}
    </>
  )
}

const RevenueTokenChanges = () => {
  const removed = useAtomValue(removedRewardTokensAtom)
  const added = useAtomValue(validAddedRewardTokensAtom)

  if (!removed.length && !added.length) return null

  return (
    <ChangeSection title="Revenue Tokens" icon={<Coins size={16} />}>
      <div className="space-y-2">
        <RemovedRewardTokens />
        <AddedRewardTokens />
      </div>
    </ChangeSection>
  )
}

export default RevenueTokenChanges