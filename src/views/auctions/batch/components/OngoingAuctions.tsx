import { Trans } from '@lingui/macro'
import { Table } from 'components/table'
import { useAtomValue } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import { currentTradesAtom } from '../../atoms'
import OngoingAuctionsSkeleton from '../../components/OngoingAuctionsSkeleton'
import useColumns from '../../components/useColumns'

const OngoingAuctions = (props: BoxProps) => {
  const columns = useColumns()
  const data = useAtomValue(currentTradesAtom)

  return (
    <Box {...props}>
      <Text variant="strong" ml={4} mb={4}>
        <Trans>Ongoing auctions</Trans>
      </Text>
      {data.length ? (
        <Table columns={columns} data={data} />
      ) : (
        <OngoingAuctionsSkeleton />
      )}
    </Box>
  )
}
export default OngoingAuctions
