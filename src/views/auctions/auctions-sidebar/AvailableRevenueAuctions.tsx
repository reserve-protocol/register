import { t } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Box, Divider } from 'theme-ui'
import { auctionsOverviewAtom, selectedAuctionsAtom } from '../atoms'
import ConfirmAuction from './ConfirmAuction'
import RevenueAuctionItem from './RevenueAuctionItem'
import RevenueBoxContainer from './RevenueBoxContainer'

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

const AvailableRevenueAuctions = () => {
  const revenueData = useAtomValue(auctionsOverviewAtom)
  const setSelectedAuctions = useSetAtom(setAuctionAtom)
  const setAuctions = useSetAtom(selectedAuctionsAtom)

  useEffect(() => {
    return () => {
      setAuctions([])
    }
  }, [])

  return (
    <RevenueBoxContainer
      title={t`Auctionable revenue`}
      icon={<AuctionsIcon />}
      subtitle={`${revenueData?.availableAuctions.length ?? 0} auctions`}
      mb={3}
    >
      {(revenueData?.availableAuctions ?? []).map((auction, index) => (
        <Box key={index}>
          {!!index && (
            <Divider mx={-4} mt={3} sx={{ borderColor: 'darkBorder' }} />
          )}
          <RevenueAuctionItem onSelect={() => null} data={auction} />
        </Box>
      ))}
      <Divider my={4} mx={-4} />
      <ConfirmAuction />
    </RevenueBoxContainer>
  )
}

export default AvailableRevenueAuctions
