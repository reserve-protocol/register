import { Trans } from '@lingui/macro'
import { Table } from 'components/table'
import { useAtomValue } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import { endedTradesAtom } from '../../atoms'
import EndedAuctionsSkeleton from '../../components/EndedAuctionsSkeleton'
import useColumns from '../../components/useColumns'

const FinalizedAuctions = (props: BoxProps) => {
  const columns = useColumns(true)
  const data = useAtomValue(endedTradesAtom)

  return (
    <Box {...props}>
      <Text variant="strong" ml={4} mb={4}>
        <Trans>Ended auctions</Trans>
      </Text>
      {data.length ? (
        <Table columns={columns} data={data} pagination={{ pageSize: 5 }} />
      ) : (
        <EndedAuctionsSkeleton />
      )}
    </Box>
  )
}

export default FinalizedAuctions
