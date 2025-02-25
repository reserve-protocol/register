import { Card } from '@/components/ui/card'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFBrandAtom } from '@/state/dtf/atoms'
import { shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, ScrollText } from 'lucide-react'
import { Link } from 'react-router-dom'

const IndexCreatorNotes = () => {
  const brandData = useAtomValue(indexDTFBrandAtom)
  const data = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  if (!brandData?.dtf?.notesFromCreator || !data) return null

  return (
    <Card className="p-6">
      <div className="flex items-center gap-1 mb-4">
        <div className="rounded-full border border-foreground p-2 mr-auto">
          <ScrollText size={14} />
        </div>
        <div className="flex items-center gap-1">
          <ScrollText size={14} strokeWidth={1} />
          <span className="text-legend">Creator:</span>
          <Link
            to={getExplorerLink(
              data.deployer,
              chainId,
              ExplorerDataType.ADDRESS
            )}
            target="_blank"
            className="flex items-center gap-1"
          >
            <span className="font-bold">
              {brandData.creator?.name || shortenAddress(data.deployer)}
            </span>
            <div className="rounded-full p-1 bg-muted">
              <ArrowUpRight size={14} />
            </div>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-4"></div>
      <h2 className="text-4xl mb-2">Notes from the creator</h2>
      <p className="text-legend">{brandData.dtf?.notesFromCreator}</p>
    </Card>
  )
}

export default IndexCreatorNotes
