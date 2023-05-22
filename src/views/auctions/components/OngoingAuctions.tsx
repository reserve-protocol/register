import { Trans } from '@lingui/macro'
import { Table } from 'components/table'
import { useAtomValue, useSetAtom } from 'jotai'
import { Box, BoxProps, Link, Text } from 'theme-ui'
import { auctionSidebarAtom, currentTradesAtom } from '../atoms'
import useColumns from './useColumns'
import useRToken from 'hooks/useRToken'

const OngoingAuctions = (props: BoxProps) => {
  const columns = useColumns()
  const data = useAtomValue(currentTradesAtom)
  const rToken = useRToken()
  const setSidebar = useSetAtom(auctionSidebarAtom)

  return (
    <Box {...props}>
      <Text variant="strong" ml={3} mb={4}>
        <Trans>Ongoing auctions</Trans>
      </Text>
      {data.length ? (
        <Table columns={columns} data={data} />
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
            No ongoing {rToken?.symbol ?? 'rtoken'}-related auctions. Check for
            available auctions/unrealized revenue{' '}
            <Link
              onClick={() => setSidebar(true)}
              sx={{ textDecoration: 'underline', color: 'text' }}
            >
              here
            </Link>{' '}
            if you want to poke the protocol to start the next auction.
          </Text>
        </Box>
      )}
    </Box>
  )
}
export default OngoingAuctions
