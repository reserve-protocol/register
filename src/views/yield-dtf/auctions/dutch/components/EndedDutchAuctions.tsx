import { Trans } from '@lingui/macro'
import { Table } from '@/components/old/table'
import { useAtomValue } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import useColumns from '@/views/yield-dtf/auctions/components/useColumns'
import { endedDutchTradesAtom } from '../atoms'
import EndedAuctionsSkeleton from '@/views/yield-dtf/auctions/components/EndedAuctionsSkeleton'

const EndedDutchAuctions = (props: BoxProps) => {
  const columns = useColumns(true)
  const data = useAtomValue(endedDutchTradesAtom)

  return (
    <Box {...props}>
      <Text variant="strong" ml={4} mb={4}>
        <Trans>Ended auctions</Trans>
      </Text>
      {data.length ? (
        <Table
          columns={columns}
          data={data}
          compact
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <EndedAuctionsSkeleton />
      )}
    </Box>
  )
}

export default EndedDutchAuctions
