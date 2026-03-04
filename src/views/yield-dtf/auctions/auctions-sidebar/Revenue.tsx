import { Trans, t } from '@lingui/macro'
import EmptyBoxIcon from 'components/icons/EmptyBoxIcon'
import { atom, useAtomValue } from 'jotai'
import { JSXElementConstructor } from 'react'
import Skeleton from 'react-loading-skeleton'
import { useTheme } from 'next-themes'
import { auctionsOverviewAtom, auctionsToSettleAtom } from '../atoms'
import AvailableRevenueAuctions from './AvailableRevenueAuctions'
import MeltingBox from './MeltingBox'
import RevenueOverviewHeader from './RevenueOverviewHeader'
import SettleableAuctions from './SettleableAuctions'
import UnavailableRevenueAuctions from './UnavailableRevenueAuctions'
import RecollaterizationAlert from './RecollaterizationAlert'
import ClaimRewards from './claim-rewards'
import StakingVaultRevenue from './StakingVaultRevenue'

const Placeholder = () => {
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  return (
    <Skeleton
      baseColor={isDarkMode ? '#090707' : undefined}
      highlightColor={isDarkMode ? '#171311' : undefined}
      height={80}
      style={{ marginBottom: 20 }}
      count={2}
      borderRadius={20}
    />
  )
}

const NoAvailableAuctions = () => (
  <div className="flex flex-col items-center my-8">
    <EmptyBoxIcon />
    <span className="mt-2 block text-legend">
      <Trans>No actionable revenue available</Trans>
    </span>
  </div>
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
    emissions: number
  } = {
    available: [],
    unavailable: [],
    availableAmount: 0,
    unavailableAmount: 0,
    isLoading: true,
    emissions: revenueData?.pendingEmissions ?? 0,
  }

  if (revenueData && settleable) {
    const {
      recollaterization,
      availableAuctionRevenue,
      unavailableAuctionRevenue,
      availableAuctions,
      unavailableAuctions,
    } = revenueData

    state.isLoading = false

    state.availableAmount = availableAuctionRevenue
    state.unavailableAmount = unavailableAuctionRevenue

    if (!recollaterization && settleable.length) {
      state.available.push(SettleableAuctions)
    }

    if (availableAuctions.length) {
      state.available.push(AvailableRevenueAuctions)
    }

    if (unavailableAuctions.length) {
      state.unavailable.push(UnavailableRevenueAuctions)
    }
  }

  return state
})

const ActionableRevenue = () => {
  const { isLoading, available, availableAmount, emissions } =
    useAtomValue(RevenueOverviewAtom)

  return (
    <>
      <RevenueOverviewHeader
        text={t`Above minimum trade volume`}
        amount={availableAmount + emissions}
        help="Run and settle auctions."
        className="mt-4"
        loading={isLoading}
      />
      {isLoading && <Placeholder />}
      {!isLoading &&
        !!available.length &&
        available.map((Component, i) => <Component key={i} />)}
      {!isLoading && !available.length && !emissions && <NoAvailableAuctions />}
      <ClaimRewards />
    </>
  )
}

const UnavailableRevenue = () => {
  const { isLoading, unavailable, unavailableAmount } =
    useAtomValue(RevenueOverviewAtom)

  return (
    <>
      <RevenueOverviewHeader
        text={t`Below minimum trade volume`}
        amount={unavailableAmount}
        muted
        help="Revenue auctions that are below the minimum trade or unavailable."
        className="mt-4"
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
  <div className="px-2 sm:px-4 overflow-auto">
    <RecollaterizationAlert />
    <ActionableRevenue />
    <UnavailableRevenue />
    <MeltingBox />
    <StakingVaultRevenue />
  </div>
)

export default Revenue
