import { Trans } from '@lingui/macro'
import { Table } from '@/components/ui/legacy-table'
import { useAtomValue } from 'jotai'
import { currentTradesAtom } from '../../atoms'
import OngoingAuctionsSkeleton from '../../components/OngoingAuctionsSkeleton'
import useColumns from '../../components/useColumns'

interface OngoingAuctionsProps {
  className?: string
}

const OngoingAuctions = ({ className }: OngoingAuctionsProps) => {
  const columns = useColumns()
  const data = useAtomValue(currentTradesAtom)

  return (
    <div className={className}>
      <span className="font-semibold ml-4 mb-4 block">
        <Trans>Ongoing auctions</Trans>
      </span>
      {data.length ? (
        <Table
          columns={columns}
          data={data}
          className="border-[4px] border-secondary"
        />
      ) : (
        <OngoingAuctionsSkeleton />
      )}
    </div>
  )
}
export default OngoingAuctions
