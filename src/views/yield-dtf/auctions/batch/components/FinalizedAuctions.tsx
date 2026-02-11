import { Trans } from '@lingui/macro'
import { Table } from '@/components/ui/legacy-table'
import { useAtomValue } from 'jotai'
import { endedTradesAtom } from '../../atoms'
import EndedAuctionsSkeleton from '../../components/EndedAuctionsSkeleton'
import useColumns from '../../components/useColumns'

interface FinalizedAuctionsProps {
  className?: string
}

const FinalizedAuctions = ({ className }: FinalizedAuctionsProps) => {
  const columns = useColumns(true)
  const data = useAtomValue(endedTradesAtom)

  return (
    <div className={className}>
      <span className="font-semibold ml-4 mb-4 block">
        <Trans>Ended auctions</Trans>
      </span>
      {data.length ? (
        <Table
          columns={columns}
          data={data}
          className="border-[4px] border-secondary"
          compact
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <EndedAuctionsSkeleton />
      )}
    </div>
  )
}

export default FinalizedAuctions
