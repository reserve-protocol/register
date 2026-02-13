import { Trans } from '@lingui/macro'
import { Table } from '@/components/ui/legacy-table'
import { useAtomValue } from 'jotai'
import useColumns from '@/views/yield-dtf/auctions/components/useColumns'
import { endedDutchTradesAtom } from '../atoms'
import EndedAuctionsSkeleton from '@/views/yield-dtf/auctions/components/EndedAuctionsSkeleton'

interface EndedDutchAuctionsProps {
  className?: string
}

const EndedDutchAuctions = ({ className }: EndedDutchAuctionsProps) => {
  const columns = useColumns(true)
  const data = useAtomValue(endedDutchTradesAtom)

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

export default EndedDutchAuctions
