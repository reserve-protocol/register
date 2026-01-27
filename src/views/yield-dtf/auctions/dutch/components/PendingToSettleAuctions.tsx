import { Trans } from '@lingui/macro'
import { Table } from '@/components/ui/legacy-table'
import { useAtomValue } from 'jotai'
import useColumns from '@/views/yield-dtf/auctions/components/useColumns'
import { pendingDutchTradesAtom } from '../atoms'

interface PendingToSettleAuctionsProps {
  className?: string
}

const PendingToSettleAuctions = ({
  className,
}: PendingToSettleAuctionsProps) => {
  const columns = useColumns(true)
  const data = useAtomValue(pendingDutchTradesAtom)

  if (!data.length) {
    return null
  }

  return (
    <div className={`mb-5 ${className || ''}`}>
      <span className="font-semibold ml-4 mb-4 block">
        <Trans>Pending auctions to settle</Trans>
      </span>
      <Table
        columns={columns}
        data={data}
        className="border-[4px] border-secondary"
      />
    </div>
  )
}

export default PendingToSettleAuctions
