import { Trans } from '@lingui/macro'
import { Table } from '@/components/old/table'
import { useAtomValue } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import useColumns from '@/views/yield-dtf/auctions/components/useColumns'
import { pendingDutchTradesAtom } from '../atoms'

const PendingToSettleAuctions = (props: BoxProps) => {
  const columns = useColumns(true)
  const data = useAtomValue(pendingDutchTradesAtom)

  if (!data.length) {
    return null
  }

  return (
    <Box {...props} mb={5}>
      <Text variant="strong" ml={4} mb={4}>
        <Trans>Pending auctions to settle</Trans>
      </Text>
      <Table columns={columns} data={data} />
    </Box>
  )
}

export default PendingToSettleAuctions
