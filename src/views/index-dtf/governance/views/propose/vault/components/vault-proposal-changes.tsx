import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue } from 'jotai'
import { Undo } from 'lucide-react'
import {
  addedRewardTokensAtom,
  removedRewardTokensAtom,
  validAddedRewardTokensAtom,
} from '../atoms'

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
    <div className="flex items-center gap-2" key={id || token.address}>
      <TokenLogo size="lg" chain={chainId} address={token.address} />
      <div className="flex flex-col mr-auto">
        <h4
          className={`text-xs ${type === 'added' ? 'text-success' : 'text-destructive'}`}
        >
          {type === 'added' ? 'Added reward' : 'Removed reward'}
        </h4>
        <a
          className="text-sm text-legend flex items-center gap-1"
          target="_blank"
          href={getExplorerLink(token.address, chainId, ExplorerDataType.TOKEN)}
          tabIndex={0}
          aria-label={`View ${token.symbol} on block explorer`}
        >
          {token.name} (${token.symbol})
        </a>
      </div>
      <Button
        variant="outline"
        size="icon-rounded"
        onClick={onRevert}
        aria-label={`Revert ${token.symbol}`}
        tabIndex={0}
      >
        <Undo size={16} />
      </Button>
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
    <div className="flex flex-col gap-1">
      {removed.map((token) => (
        <RewardTokenItem
          key={token.address}
          token={token}
          type="removed"
          onRevert={() => handleRevert(token.address)}
        />
      ))}
    </div>
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
    <div className="flex flex-col gap-1">
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
    </div>
  )
}

const VaultProposalChanges = () => {
  const removed = useAtomValue(removedRewardTokensAtom)
  const added = useAtomValue(validAddedRewardTokensAtom)

  if (!removed.length && !added.length)
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm text-center text-legend">No changes</p>
      </div>
    )

  return (
    <div>
      <RemovedRewardTokens />
      <AddedRewardTokens />
    </div>
  )
}

export default VaultProposalChanges
