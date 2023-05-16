import { Trans } from '@lingui/macro'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Box, Divider, Spinner, Text } from 'theme-ui'
import { auctionsOverviewAtom, selectedAuctionsAtom } from '../atoms'
import RevenueAuctionItem from './RevenueAuctionItem'

const setAuctionAtom = atom(null, (get, set, index: number) => {
  const selected = get(selectedAuctionsAtom)
  const itemIndex = selected.indexOf(index)

  if (itemIndex === -1) {
    selected.push(index)
  } else {
    selected.splice(itemIndex, 1)
  }

  set(selectedAuctionsAtom, [...selected])
})

const RevenueAuctionList = () => {
  const data = useAtomValue(auctionsOverviewAtom)
  const setSelectedAuctions = useSetAtom(setAuctionAtom)

  return (
    <Box
      variant="layout.borderBox"
      p={4}
      sx={{ backgroundColor: 'contentBackground' }}
      mb={4}
    >
      <Text variant="subtitle" mb={4}>
        <Trans>Revenue auctions</Trans>
      </Text>
      {!!data &&
        data.revenue.map((auction, index) => (
          <Box key={index}>
            {!!index && (
              <Divider mx={-4} mt={3} sx={{ borderColor: 'darkBorder' }} />
            )}
            <RevenueAuctionItem
              onSelect={() => setSelectedAuctions(index)}
              data={auction}
            />
          </Box>
        ))}
      {!data && <Spinner />}
    </Box>
  )
}

export default RevenueAuctionList
