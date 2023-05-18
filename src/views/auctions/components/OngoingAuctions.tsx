import { Trans } from '@lingui/macro'
import { Table } from 'components/table'
import { useAtomValue } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import { currentTradesAtom } from '../atoms'
import useColumns from './useColumns'

const OngoingAuctions = (props: BoxProps) => {
  const columns = useColumns()
  const data = useAtomValue(currentTradesAtom)

  if (!data.length) {
    return null
  }

  return (
    <Box {...props}>
      <Text variant="strong" ml={3} mb={4}>
        <Trans>Ongoing auctions</Trans>
      </Text>
      <Table columns={columns} data={data} />
    </Box>
  )
}
export default OngoingAuctions
