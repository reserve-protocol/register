import { Box, Divider } from 'theme-ui'
import RevenueBoxContainer from './RevenueBoxContainer'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import { t } from '@lingui/macro'
import { useAtomValue } from 'jotai'
import { auctionsOverviewAtom } from '../atoms'
import RevenueAuctionItem from './RevenueAuctionItem'

const UnavailableRevenueAuctions = () => {
  const revenueData = useAtomValue(auctionsOverviewAtom)

  return (
    <RevenueBoxContainer
      title={t`Unavailable revenue auctions`}
      icon={<AuctionsIcon />}
      subtitle={`${revenueData?.unavailableAuctions.length ?? 0} auctions`}
      btnLabel="Inspect"
      muted
      mb={3}
    >
      {(revenueData?.unavailableAuctions ?? []).map((auction, index) => (
        <Box key={index}>
          {!!index && (
            <Divider mx={-4} mt={3} sx={{ borderColor: 'darkBorder' }} />
          )}
          <RevenueAuctionItem onSelect={() => null} data={auction} />
        </Box>
      ))}
    </RevenueBoxContainer>
  )
}

export default UnavailableRevenueAuctions
