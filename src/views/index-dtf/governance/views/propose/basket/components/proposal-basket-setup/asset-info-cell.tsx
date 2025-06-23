import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { TableCell } from '@/components/ui/table'
import { chainIdAtom } from '@/state/chain/atoms/chainAtoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtom, useAtomValue } from 'jotai'
import { ArrowUpRight, PaintBucket } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  IndexAssetShares,
  isUnitBasketAtom,
  proposedIndexBasketStateAtom,
  proposedSharesAtom,
} from '../../atoms'

const AssetCellInfo = ({ asset }: { asset: IndexAssetShares }) => {
  const chainId = useAtomValue(chainIdAtom)
  const state = useAtomValue(proposedIndexBasketStateAtom)
  const [targetShares, setTargetShares] = useAtom(proposedSharesAtom)
  const isUnitBasket = useAtomValue(isUnitBasketAtom)

  const canFill =
    !isUnitBasket &&
    state.remainingAllocation !== 0 &&
    !state.isValid &&
    Number(targetShares[asset.token.address]) + state.remainingAllocation >= 0
  const negativeAllocation = state.remainingAllocation < 0

  const handleFill = () => {
    setTargetShares({
      ...targetShares,
      [asset.token.address]: (
        Number(targetShares[asset.token.address]) + state.remainingAllocation
      ).toFixed(2),
    })
  }

  return (
    <TableCell className="border-r">
      <div className="flex items-center gap-2 cursor-pointer group">
        <TokenLogo
          size="xl"
          symbol={asset.token.symbol}
          address={asset.token.address}
          chain={chainId}
        />
        <div className="mr-auto">
          <h4 className="font-bold mb-1">{asset.token.symbol}</h4>
          <Link
            to={getExplorerLink(
              asset.token.address,
              chainId,
              ExplorerDataType.TOKEN
            )}
            tabIndex={-1}
            target="_blank"
            className="text-sm text-legend hover:underline hover:text-primary"
          >
            {shortenAddress(asset.token.address)}{' '}
            <ArrowUpRight size={14} className="inline" />
          </Link>
        </div>

        {canFill && (
          <Button variant="outline" size="icon-rounded" onClick={handleFill}>
            <PaintBucket className={negativeAllocation ? 'scale-x-[-1]' : ''} />
          </Button>
        )}
      </div>
    </TableCell>
  )
}

export default AssetCellInfo
