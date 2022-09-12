import { t, Trans } from '@lingui/macro'
import { Container } from 'components'
import { Box, BoxProps, Text } from 'theme-ui'
import { ContentHead } from 'components/info-box'
import useRToken from 'hooks/useRToken'
import { Table } from 'components/table'
import { useMemo } from 'react'

const OutgoingAuctions = (props: BoxProps) => {
  const columns = useMemo(
    () => [
      {
        Header: t`Selling`,
        accessor: 'test6',
      },
      { Header: t`Buying`, accessor: 'test2' },
      { Header: t`Worst case price`, accessor: 'test3' }, // TODO: replace
      { Header: t`Ends at`, accessor: 'test4' },
      { Header: '', accessor: 'test5' }, // Auction link
    ],
    []
  )
  const data = []

  return (
    <Box {...props}>
      <Text variant="title" sx={{ fontSize: 3 }} ml={5} mb={4}>
        <Trans>Ongoing Auctions</Trans>
      </Text>
      {data.length ? (
        <Table columns={columns} data={[]} />
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
          <Text>
            <Trans>No ongoing auctions</Trans>
          </Text>
        </Box>
      )}
    </Box>
  )
}

const FinalizedAuctions = (props: BoxProps) => {
  const columns = useMemo(
    () => [
      {
        Header: t`Sold`,
        accessor: 'test6',
      },
      { Header: t`Bought`, accessor: 'test' },
      { Header: t`Total amount traded`, accessor: 'test3' }, // TODO: replace
      { Header: t`Ended at`, accessor: 'test4' },
      { Header: '', accessor: 'test5' }, // Auction link
    ],
    []
  )

  const data = []

  return (
    <Box {...props}>
      <Text variant="title" sx={{ fontSize: 3 }} ml={5} mb={4}>
        <Trans>Ended Auctions</Trans>
      </Text>
      {data.length ? (
        <Table columns={columns} data={[]} />
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
          <Text>
            <Trans>No ended auctions</Trans>
          </Text>
        </Box>
      )}{' '}
    </Box>
  )
}

const Auctions = () => {
  const rToken = useRToken()

  return (
    <Container>
      <ContentHead
        title={rToken?.symbol + ' ' + t`related Auctions`}
        subtitle={t`Ongoing & historical auctions of USD+ from the Gnosis Auction app`}
        mb={7}
        ml={5}
      />
      <OutgoingAuctions mb={7} />
      <FinalizedAuctions />
    </Container>
  )
}

export default Auctions
