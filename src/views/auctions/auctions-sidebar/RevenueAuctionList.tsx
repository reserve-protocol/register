import { Trans } from '@lingui/macro'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Box, Button, Divider, Spinner, Text } from 'theme-ui'
import { auctionsOverviewAtom, selectedAuctionsAtom } from '../atoms'
import RevenueAuctionItem from './RevenueAuctionItem'
import { SmallButton } from 'components/button'

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
      <Box variant="layout.verticalAlign" mb={4}>
        <Text variant="subtitle">
          <Trans>Revenue auctions</Trans>
        </Text>
        {!!data?.recollaterization && (
          <Text ml="auto" variant="legend" sx={{ fontSize: 1 }}>
            <Trans>Available after recollateralization</Trans>
          </Text>
        )}
      </Box>

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
      {!data && (
        <Box sx={{ textAlign: 'center' }}>
          <Spinner size={24} />
        </Box>
      )}
    </Box>
  )
}

export default RevenueAuctionList
