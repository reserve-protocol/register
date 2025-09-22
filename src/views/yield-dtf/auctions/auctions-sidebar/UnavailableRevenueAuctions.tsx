import TransactionButton from '@/components/old/button/TransactionButton'
import { t } from '@lingui/macro'
import FacadeAct from 'abis/FacadeAct'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { chainIdAtom } from 'state/atoms'
import { Box, Divider } from 'theme-ui'
import { FACADE_ACT_ADDRESS } from 'utils/addresses'
import { Address, Hex, encodeFunctionData } from 'viem'
import { UseSimulateContractParameters } from 'wagmi'
import {
  auctionSidebarAtom,
  auctionsOverviewAtom,
  selectedUnavailableAuctionsAtom,
} from '../atoms'
import RevenueAuctionItem from './RevenueAuctionItem'
import RevenueBoxContainer from './RevenueBoxContainer'

const setAuctionAtom = atom(null, (get, set, index: number) => {
  const selected = get(selectedUnavailableAuctionsAtom)
  const itemIndex = selected.indexOf(index)

  if (itemIndex === -1) {
    selected.push(index)
  } else {
    selected.splice(itemIndex, 1)
  }

  set(selectedUnavailableAuctionsAtom, [...selected])
})

// TODO: Removed a lot of the logic, rethink this feature
const auctionsTxAtom = atom((get): UseSimulateContractParameters => {
  const { unavailableAuctions: revenue = [] } = get(auctionsOverviewAtom) || {}
  const chainId = get(chainIdAtom)
  const selectedAuctions = get(selectedUnavailableAuctionsAtom)

  const traderAuctions = selectedAuctions.reduce(
    (auctions, selectedIndex) => {
      auctions[revenue[selectedIndex].trader] = [
        ...(auctions[revenue[selectedIndex].trader] || []),
        revenue[selectedIndex].sell.address,
      ]

      return auctions
    },
    {} as { [x: Address]: Address[] }
  )

  const traders = new Set([...Object.keys(traderAuctions)])

  const transactions = ([...traders] as Address[]).reduce(
    (auctions, trader) => {
      return [
        ...auctions,
        encodeFunctionData({
          abi: FacadeAct,
          functionName: 'runRevenueAuctions',
          args: [
            trader,
            [],
            traderAuctions[trader] || [],
            new Array(traderAuctions[trader]?.length ?? 0).fill(0),
          ],
        }),
      ]
    },
    [] as Hex[]
  )

  return {
    abi: FacadeAct,
    address: FACADE_ACT_ADDRESS[chainId],
    args: [transactions],
    functionName: 'multicall',
    query: { enabled: !!transactions.length },
  }
})

const useAuctions = () => {
  const tx = useAtomValue(auctionsTxAtom)

  return useContractWrite(tx)
}

// TODO: maybe unnecesary
const ConfirmAuction = () => {
  const { isReady, write, hash, isLoading } = useAuctions()
  const { status } = useWatchTransaction({ hash, label: 'Run auctions' })
  const closeSidebar = useSetAtom(auctionSidebarAtom)

  useEffect(() => {
    if (status === 'success') {
      closeSidebar()
    }
  }, [status])

  return (
    <Box>
      <TransactionButton
        fullWidth
        text="Run auctions"
        variant={isLoading ? 'accentAction' : 'primary'}
        disabled={!isReady}
        loading={isLoading || (hash && status !== 'success')}
        onClick={write}
      />
    </Box>
  )
}

const UnavailableRevenueAuctions = () => {
  const revenueData = useAtomValue(auctionsOverviewAtom)
  const setSelectedAuctions = useSetAtom(setAuctionAtom)
  const setAuctions = useSetAtom(selectedUnavailableAuctionsAtom)

  useEffect(() => {
    return () => {
      setAuctions([])
    }
  }, [])

  return (
    <RevenueBoxContainer
      title={t`Small revenue auctions`}
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
          <RevenueAuctionItem
            onSelect={() => setSelectedAuctions(index)}
            data={auction}
          />
        </Box>
      ))}
      <Divider my={4} mx={-4} />
      <ConfirmAuction />
    </RevenueBoxContainer>
  )
}

export default UnavailableRevenueAuctions
