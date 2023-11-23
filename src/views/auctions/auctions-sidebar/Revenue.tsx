import { Trans, t } from '@lingui/macro'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { atom, useAtomValue } from 'jotai'
import { JSXElementConstructor } from 'react'
import Skeleton from 'react-loading-skeleton'
import { Box, Flex, Text } from 'theme-ui'
import { auctionsOverviewAtom, auctionsToSettleAtom } from '../atoms'
import AvailableRevenueAuctions from './AvailableRevenueAuctions'
import MeltingBox from './MeltingBox'
import RevenueOverviewHeader from './RevenueOverviewHeader'
import SettleableAuctions from './SettleableAuctions'
import UnavailableRevenueAuctions from './UnavailableRevenueAuctions'

const Placeholder = () => (
  <Skeleton
    height={80}
    style={{ marginBottom: 20 }}
    count={2}
    borderRadius={20}
  />
)

const NoAvailableAuctions = () => (
  <Flex my={5} sx={{ alignItems: 'center', flexDirection: 'column' }}>
    <EmptyBoxIcon />
    <Text mt={2} sx={{ display: 'block' }} variant="legend">
      <Trans>No actionable revenue available</Trans>
    </Text>
  </Flex>
)

// Distribute components between Available/Unavailable and aggregate amounts
const RevenueOverviewAtom = atom((get) => {
  const revenueData = get(auctionsOverviewAtom)
  const settleable = get(auctionsToSettleAtom)
  const state: {
    available: JSXElementConstructor<any>[]
    unavailable: JSXElementConstructor<any>[]
    availableAmount: number
    unavailableAmount: number
    isLoading: boolean
  } = {
    available: [],
    unavailable: [],
    availableAmount: 0,
    unavailableAmount: 0,
    isLoading: true,
  }

  if (revenueData && settleable) {
    const {
      pendingToMelt,
      availableAuctionRevenue,
      unavailableAuctionRevenue,
      availableAuctions,
      unavailableAuctions,
    } = revenueData

    state.isLoading = false
    state.availableAmount = availableAuctionRevenue + pendingToMelt
    state.unavailableAmount = unavailableAuctionRevenue

    if (settleable.length) {
      state.available.push(SettleableAuctions)
    }

    if (availableAuctions.length) {
      state.available.push(AvailableRevenueAuctions)
    }

    if (unavailableAuctions.length) {
      state.unavailable.push(UnavailableRevenueAuctions)
    }

    if (pendingToMelt > 0.1) {
      state.available.push(MeltingBox)
    } else {
      state.unavailable.push(MeltingBox)
    }
  }

  return state
})

const ActionableRevenue = () => {
  const { isLoading, available, availableAmount } =
    useAtomValue(RevenueOverviewAtom)

  return (
    <>
      <RevenueOverviewHeader
        text={t`Actionable accumulated revenue`}
        amount={availableAmount}
        help="text"
        mt={4}
        loading={isLoading}
      />
      {isLoading && <Placeholder />}
      {!isLoading &&
        !!available.length &&
        available.map((Component, i) => <Component key={i} />)}
      {!isLoading && !available.length && <NoAvailableAuctions />}
    </>
  )
}

const UnavailableRevenue = () => {
  const { isLoading, unavailable, unavailableAmount } =
    useAtomValue(RevenueOverviewAtom)

  return (
    <>
      <RevenueOverviewHeader
        text={t`Unactionable revenue/revenue sources`}
        amount={unavailableAmount}
        muted
        help="text"
        mt={4}
        loading={isLoading}
      />
      {isLoading && <Placeholder />}
      {!isLoading &&
        !!unavailable.length &&
        unavailable.map((Component, i) => <Component key={i} />)}
    </>
  )
}

const Revenue = () => (
  <Box px={4} sx={{ overflow: 'auto' }}>
    <ActionableRevenue />
    <UnavailableRevenue />
  </Box>
)

export default Revenue
