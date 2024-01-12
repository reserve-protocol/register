import { atom, useAtomValue } from 'jotai'
import { Box, BoxProps } from 'theme-ui'
import { Claimable, auctionsOverviewAtom } from '../atoms'
import RevenueBoxContainer from './RevenueBoxContainer'
import { t } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'

const ClaimRewards = () => {
  const data = useAtomValue(auctionsOverviewAtom)

  if (!data || !data.pendingEmissions) {
    return null
  }

  return (
    <RevenueBoxContainer
      title={t`Claimable emissions`}
      icon={<AuctionsIcon />}
      subtitle={`${data.claimableEmissions.length} auctions`}
      mb={3}
    ></RevenueBoxContainer>
  )
}

export default ClaimRewards
