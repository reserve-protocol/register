import { Trans } from '@lingui/macro'
import { Table } from 'components/table'
import { useAtomValue } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import { endedTradesAtom } from '../atoms'
import useColumns from './useColumns'

const FinalizedAuctions = (props: BoxProps) => {
  const columns = useColumns(true)
  const data = useAtomValue(endedTradesAtom)

  return (
    <Box {...props}>
      <Text variant="strong" ml={3} mb={4}>
        <Trans>Ended auctions</Trans>
      </Text>
      {data.length ? (
        <Table columns={columns} data={data} pagination />
      ) : (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'darkBorder',
            textAlign: 'center',
            borderRadius: 16,
          }}
          p={6}
        >
          <Text variant="legend">
            <Trans>No ended auctions</Trans>
          </Text>
        </Box>
      )}{' '}
    </Box>
  )
}

export default FinalizedAuctions
